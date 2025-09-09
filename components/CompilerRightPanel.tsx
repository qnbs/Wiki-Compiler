import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// FIX: Imported RightPaneView from types.ts.
import { Project, AppSettings, RightPaneView } from '../types';
import Spinner from './Spinner';
import Icon from './Icon';
import ArticleEditor from './ArticleEditor';
import CompilerExportSettings from './CompilerExportSettings';
import AIEditorModal from './AIEditorModal';
import { editTextWithAi } from '../services/geminiService';
import { LexicalEditor, $getSelection, $isRangeSelection, TextNode, $getRoot } from 'lexical';
import { saveProjectArticleContent, getProjectArticleContent } from '../services/dbService';

// FIX: Removed local RightPaneView type definition, which is now centralized in types.ts.
// export type RightPaneView = 'settings' | 'article';

interface CompilerRightPanelProps {
  project: Project;
  updateProject: (project: Project) => void;
  activeArticleTitle: string | null;
  getArticleContent: (title: string) => Promise<string>;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  view: RightPaneView;
  setView: (view: RightPaneView) => void;
  onGenerateMarkdown: () => void;
  onGenerateJson: () => void;
  onGenerateDocx: () => void;
  onGenerateOdt: () => void;
}

const CompilerRightPanel: React.FC<CompilerRightPanelProps> = ({
  project,
  activeArticleTitle,
  getArticleContent,
  view,
  setView,
  onGenerateDocx,
  onGenerateJson,
  onGenerateMarkdown,
  onGenerateOdt
}) => {
  const { t } = useTranslation();
  const [articleHtml, setArticleHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  
  const editorRef = useRef<LexicalEditor | null>(null);

  useEffect(() => {
    const loadContent = async () => {
        if (activeArticleTitle) {
          setIsLoading(true);
          const editedContent = await getProjectArticleContent(project.id, activeArticleTitle);
          if (editedContent) {
              setArticleHtml(editedContent.html);
          } else {
              const originalHtml = await getArticleContent(activeArticleTitle);
              setArticleHtml(originalHtml);
          }
          setIsLoading(false);
        } else {
          setArticleHtml(null);
        }
    };
    loadContent().catch(console.error);
  }, [activeArticleTitle, getArticleContent, project.id]);

  const handleArticleUpdate = (html: string) => {
    if (activeArticleTitle) {
      saveProjectArticleContent({
        id: `${project.id}-${activeArticleTitle}`,
        projectId: project.id,
        title: activeArticleTitle,
        html,
      });
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


  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (view === 'article' && activeArticleTitle && articleHtml !== null) {
      return (
        <ArticleEditor
            key={activeArticleTitle}
            content={articleHtml}
            onUpdate={handleArticleUpdate}
            editable={true}
            onEditorCreated={(editor) => { editorRef.current = editor; }}
            onAiEditClick={() => setIsAiModalOpen(true)}
            placeholder={t('Start writing or edit the article content...')}
        />
      );
    }
    
    if (view === 'settings') {
      return (
        <CompilerExportSettings
          onGenerateDocx={onGenerateDocx}
          onGenerateJson={onGenerateJson}
          onGenerateMarkdown={onGenerateMarkdown}
          onGenerateOdt={onGenerateOdt}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
        <Icon name="compiler" className="w-16 h-16 mb-4" />
        <p className="text-lg">{t('Select an article to edit')}</p>
        <p>{t('or manage project settings and export options.')}</p>
      </div>
    );
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
    <div className="md:col-span-7 lg:col-span-8 overflow-y-auto">
      <div className="flex items-center gap-2 border-b dark:border-gray-700 pb-2 mb-4">
        <button
          onClick={() => setView('settings')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${view === 'settings' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          {t('Export & Settings')}
        </button>
        {activeArticleTitle && (
            <button
                onClick={() => setView('article')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md truncate max-w-xs ${view === 'article' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                {activeArticleTitle}
            </button>
        )}
      </div>
      <div className="p-1">
        {renderContent()}
      </div>
      <AIEditorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onRunAiEdit={handleRunAiEdit}
        isEditing={isAiEditing}
        error={aiEditError}
        selectedText={getSelectedText()}
      />
    </div>
  );
};

export default CompilerRightPanel;