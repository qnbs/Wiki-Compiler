import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArticleContent } from '../types';
import { useImporter } from '../hooks/useImporterContext';
import { useImageImporter } from '../hooks/useImageImporterContext';
import { useToasts } from '../hooks/useToasts';
import { saveArticleCache } from '../services/dbService';
import { generateSingleArticleDocx, generateSingleArticleOdt } from '../services/exportService';
import Icon from './Icon';
import Spinner from './Spinner';
import ArticleEditor from './ArticleEditor';
import AIEditorModal from './AIEditorModal';
import { LexicalEditor, $getSelection, $isRangeSelection, TextNode, $getRoot } from 'lexical';
import { editTextWithAi } from '../services/geminiService';

interface ImporterViewProps {
  getArticleContent: (title: string) => Promise<string>;
}

const ImporterView: React.FC<ImporterViewProps> = ({ getArticleContent }) => {
  const { t } = useTranslation();
  const { stagedArticles, removeArticle, clearImporter } = useImporter();
  const { addImage } = useImageImporter();
  const { addToast } = useToasts();
  
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editorContent, setEditorContent] = useState<string>('');
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const editorRef = React.useRef<LexicalEditor | null>(null);

  const handleSelectArticle = useCallback(async (article: ArticleContent) => {
    setIsLoading(true);
    setSelectedArticle(article);
    setEditorContent('');
    
    const html = await getArticleContent(article.title);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extract images and add them to the image importer
    tempDiv.querySelectorAll('figure, .thumb, .gallery').forEach(container => {
        const img = container.querySelector('img');
        if (img) {
            const captionEl = container.querySelector('figcaption, .caption');
            addImage({
                srcUrl: img.src,
                altText: img.alt,
                caption: captionEl ? captionEl.textContent || '' : '',
                originalArticleTitle: article.title,
            });
        }
        container.remove();
    });
     tempDiv.querySelectorAll('img').forEach(img => {
         addImage({
            srcUrl: img.src,
            altText: img.alt,
            caption: '',
            originalArticleTitle: article.title,
        });
        img.remove();
     });

    setEditorContent(tempDiv.innerHTML);
    setIsLoading(false);
  }, [getArticleContent, addImage]);
  
  const handleSaveToArchive = async () => {
    if (!selectedArticle || !editorContent) return;

    const articleToSave: ArticleContent = {
      ...selectedArticle,
      html: editorContent,
    };
    await saveArticleCache(articleToSave);
    addToast(t("Article '{{title}}' saved to archive!", { title: selectedArticle.title }), 'success');
    
    removeArticle(selectedArticle.title);
    setSelectedArticle(null);
    setEditorContent('');
  };

  const handleExportDocx = () => {
    if (selectedArticle && editorContent) {
      generateSingleArticleDocx(selectedArticle.title, editorContent);
    }
  };

  const handleExportOdt = () => {
    if (selectedArticle && editorContent) {
      generateSingleArticleOdt(selectedArticle.title, editorContent);
    }
  };
  
 const handleRunAiEdit = async (prompt: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    setIsAiEditing(true);
    setAiEditError(null);
    
    let targetText: string = '';
    let isFullArticle = false;

    editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
            targetText = selection.getTextContent();
        } else {
            targetText = $getRoot().getTextContent();
            isFullArticle = true;
        }
    });
    
    if (!targetText.trim()) {
        setAiEditError("No text selected or editor is empty.");
        setIsAiEditing(false);
        return;
    }

    try {
        const editedText = await editTextWithAi(prompt, targetText);
        editor.update(() => {
            if (isFullArticle) {
                const root = $getRoot();
                root.clear();
                const textNode = new TextNode(editedText);
                root.append(textNode);
            } else {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    selection.insertText(editedText);
                }
            }
        });
        setIsAiModalOpen(false);
    } catch(error) {
        setAiEditError(error instanceof Error ? error.message : String(error));
    } finally {
        setIsAiEditing(false);
    }
  };

   const getSelectedText = () => {
    if (!editorRef.current) return undefined;
    
    let selectedText: string | undefined;
    editorRef.current.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
            selectedText = selection.getTextContent();
        }
    });
    return selectedText;
  };

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Importer List Column */}
      <div className="md:col-span-4 lg:col-span-3 overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{t('Articles to Import')}</h2>
            {stagedArticles.length > 0 && (
                <button onClick={clearImporter} className="text-sm text-red-500 hover:underline">
                    {t('Clear Importer')}
                </button>
            )}
        </div>
        
        {stagedArticles.length > 0 ? (
            <ul className="space-y-2">
            {stagedArticles.map(article => (
                <li
                key={article.title}
                onClick={() => handleSelectArticle(article)}
                className={`group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedArticle?.title === article.title ? 'bg-accent-100 dark:bg-accent-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                <span className="font-semibold truncate">{article.title}</span>
                <button 
                    onClick={(e) => { e.stopPropagation(); removeArticle(article.title); }}
                    className="p-1 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500"
                    aria-label={t('Remove from Importer')}
                >
                    <Icon name="x-mark" className="w-5 h-5"/>
                </button>
                </li>
            ))}
            </ul>
        ) : (
             <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8 rounded-lg border-2 border-dashed dark:border-gray-700">
              <Icon name="upload" className="w-12 h-12 mb-2"/>
              <p>{t('Your importer is empty.')}</p>
              <p className="text-sm">{t('Go to the Library to add articles to the importer.')}</p>
            </div>
        )}
      </div>

      {/* Editor Column */}
      <div className="md:col-span-8 lg:col-span-9 overflow-y-auto">
        {isLoading ? (
             <div className="flex justify-center items-center h-full"><Spinner/></div>
        ) : selectedArticle ? (
          <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b pb-2 dark:border-gray-600">
                <h2 className="text-3xl font-bold flex-grow">{selectedArticle.title}</h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={handleExportDocx} className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold">
                        <Icon name="document" className="w-4 h-4" /> {t('Export to DOCX')}
                    </button>
                    <button onClick={handleExportOdt} className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold">
                        <Icon name="document" className="w-4 h-4" /> {t('Export to ODT')}
                    </button>
                    <button onClick={handleSaveToArchive} className="flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm font-semibold">
                        <Icon name="archive-box" className="w-4 h-4" /> {t('Save to Archive')}
                    </button>
                </div>
            </div>
            <ArticleEditor
                key={selectedArticle.title}
                content={editorContent}
                onUpdate={setEditorContent}
                editable={true}
                onEditorCreated={(editor) => { editorRef.current = editor; }}
                onAiEditClick={() => setIsAiModalOpen(true)}
                placeholder={t('Start writing or edit the article content...')}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <Icon name="book" className="w-16 h-16 mb-4" />
            <p className="text-lg">{t('Select an article to edit and save')}</p>
          </div>
        )}
      </div>
    </div>
    <AIEditorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onRunAiEdit={handleRunAiEdit}
        isEditing={isAiEditing}
        error={aiEditError}
        selectedText={getSelectedText()}
      />
    </>
  );
};

export default memo(ImporterView);