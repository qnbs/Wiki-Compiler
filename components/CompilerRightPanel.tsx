import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import type { Editor } from '@tiptap/core';

import { Project, AppSettings, CustomCitation, ProjectArticleContent, PdfOptions } from '../types';
import { RightPaneView } from './CompilerView';
import { useArticleAnalysis } from '../hooks/useArticleAnalysis';
import { useDebounce } from '../hooks/useDebounce';
import { getProjectArticleContent, saveProjectArticleContent } from '../services/dbService';
import { editTextWithAi, isAiConfigured } from '../services/geminiService';
import { generateMarkdownContent, generateHtmlFile, generatePlainTextFile } from '../services/exportService';
import { useToasts } from '../../hooks/useToasts';

import Icon from './Icon';
import Spinner from './Spinner';
import Modal from './Modal';
import AIEditorModal from './AIEditorModal';
import ArticleInsightsView from './ArticleInsightsView';
import ArticleEditor from './ArticleEditor';
import CompilerExportSettings from './CompilerExportSettings';

interface CompilerRightPanelProps {
  project: Project;
  updateProject: (project: Project) => void;
  activeArticleTitle: string | null;
  getArticleContent: (title: string) => Promise<string>;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  view: RightPaneView;
  setView: (view: RightPaneView) => void;
  onGeneratePdf: (options: PdfOptions) => void;
  onGenerateMarkdown: () => void;
  onGenerateJson: () => void;
  onGenerateDocx: () => void;
  isGeneratingPdf: boolean;
}

const countWords = (htmlString: string): number => {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    const text = div.textContent || div.innerText || "";
    return text.trim().split(/\s+/).filter(Boolean).length;
};

const CompilerRightPanel: React.FC<CompilerRightPanelProps> = ({
  project,
  updateProject,
  activeArticleTitle,
  getArticleContent,
  settings,
  updateSettings,
  view,
  setView,
  onGeneratePdf,
  onGenerateMarkdown,
  onGenerateJson,
  onGenerateDocx,
  isGeneratingPdf,
}) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  
  const [activeArticleContent, setActiveArticleContent] = useState<string | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const debouncedArticleContent = useDebounce(activeArticleContent, 1000);
  
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [markdownPreview, setMarkdownPreview] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [totalWordCount, setTotalWordCount] = useState(0);

  const [isAiEditorOpen, setIsAiEditorOpen] = useState(false);
  const [aiEditorSelectedText, setAiEditorSelectedText] = useState('');
  const [isEditingWithAi, setIsEditingWithAi] = useState(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [articleWordCount, setArticleWordCount] = useState(0);

  const [pdfOptions, setPdfOptions] = useState<PdfOptions>(settings.compiler.defaultPdfOptions);
  
  const [isGeneratingMarkdown, setIsGeneratingMarkdown] = useState(false);
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);
  const [isGeneratingPlainText, setIsGeneratingPlainText] = useState(false);
  const [isGeneratingJson, setIsGeneratingJson] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);

  const { insights, isAnalyzing, analysisError, analyze, clearAnalysis } = useArticleAnalysis(
    activeArticleTitle && activeArticleContent ? { title: activeArticleTitle, html: activeArticleContent } : null
  );
  
  const handleEditorCreated = useCallback((editor: Editor) => {
    setEditorInstance(editor);
  }, []);
  
  useEffect(() => {
    const loadContent = async () => {
      if (activeArticleTitle) {
        setIsLoadingArticle(true);
        setActiveArticleContent(null);
        clearAnalysis();
        setIsDirty(false);
        try {
          const modifiedContent = await getProjectArticleContent(project.id, activeArticleTitle);
          const htmlContent = modifiedContent ? modifiedContent.html : await getArticleContent(activeArticleTitle);
          setActiveArticleContent(htmlContent);
          setArticleWordCount(countWords(htmlContent));
        } catch (error) {
          console.error("Failed to load article:", error);
          addToast('Failed to load article content.', 'error');
          setView('settings');
        } finally {
          setIsLoadingArticle(false);
        }
      } else {
        setActiveArticleContent(null);
        setArticleWordCount(0);
      }
    };
    loadContent();
  }, [activeArticleTitle, project.id, getArticleContent, clearAnalysis, setView, addToast]);

  useEffect(() => {
    const saveContent = async () => {
      if (isDirty && debouncedArticleContent && activeArticleTitle) {
        const contentToSave: ProjectArticleContent = {
          id: `${project.id}-${activeArticleTitle}`,
          projectId: project.id,
          title: activeArticleTitle,
          html: debouncedArticleContent,
        };
        await saveProjectArticleContent(contentToSave);
        setIsDirty(false);
        addToast(t('Article changes saved.'), 'success');
      }
    };
    saveContent();
  }, [debouncedArticleContent, activeArticleTitle, isDirty, project.id, addToast, t]);
  
  useEffect(() => {
    const generatePreview = async () => {
      if (view === 'markdown' && project.articles.length > 0) {
        setIsGeneratingPreview(true);
        try {
          const markdown = await generateMarkdownContent(project, getArticleContent);
          setTotalWordCount(countWords(markdown));
          const html = await marked.parse(markdown);
          setMarkdownPreview(html as string);
        } catch (error) {
          console.error("Failed to generate markdown preview:", error);
          setMarkdownPreview('<p>Error generating preview.</p>');
        } finally {
          setIsGeneratingPreview(false);
        }
      }
    };
    generatePreview();
  }, [view, project, getArticleContent]);

  const handleContentUpdate = (html: string) => {
    setActiveArticleContent(html);
    setArticleWordCount(countWords(html));
    setIsDirty(true);
  };
  
  const handleInsertCitation = (key: string, text: string) => {
    if (!editorInstance) return;
    const citationHtml = `<cite data-citation-key="${key}">${text}</cite>`;
    editorInstance.chain().focus().insertContent(citationHtml).run();
    setIsCitationModalOpen(false);
  };

  const handleOpenAiEditor = () => {
    if (!editorInstance) return;
    const { from, to, empty } = editorInstance.state.selection;
    const selectedText = empty ? '' : editorInstance.state.doc.textBetween(from, to);
    setAiEditorSelectedText(selectedText);
    setIsAiEditorOpen(true);
  }

  const handleRunAiEdit = async (prompt: string) => {
    if (!editorInstance) return;

    setIsEditingWithAi(true);
    setAiEditError(null);

    const { from, to, empty } = editorInstance.state.selection;
    const textToEdit = empty ? editorInstance.getText() : editorInstance.state.doc.textBetween(from, to);

    if (!textToEdit.trim()) {
      setAiEditError("No text to edit. Select text or have content in the editor.");
      setIsEditingWithAi(false);
      return;
    }

    try {
      const editedText = await editTextWithAi(prompt, textToEdit);
      const transaction = empty
        ? editorInstance.chain().focus().selectAll().insertContent(editedText)
        : editorInstance.chain().focus().insertContentAt({ from, to }, editedText);
      transaction.run();
      setIsAiEditorOpen(false);
    } catch (error) {
      setAiEditError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsEditingWithAi(false);
    }
  };

  const handleGenerateMarkdownWrapper = useCallback(async () => {
    setIsGeneratingMarkdown(true);
    addToast(t('Exporting Markdown...'), 'info');
    try {
        await onGenerateMarkdown();
    } finally {
        setIsGeneratingMarkdown(false);
    }
  }, [onGenerateMarkdown, addToast, t]);
  
  const handleGenerateHtml = useCallback(async () => {
    if (!project || !settings) return;
    setIsGeneratingHtml(true);
    addToast(t('Exporting HTML...'), 'info');
    try {
        await generateHtmlFile(project, pdfOptions, settings, getArticleContent);
    } catch (error) {
        console.error("HTML export failed:", error);
        addToast(t('HTML export failed.'), 'error');
    } finally {
        setIsGeneratingHtml(false);
    }
  }, [project, settings, getArticleContent, pdfOptions, addToast, t]);

  const handleGeneratePlainText = useCallback(async () => {
    if (!project) return;
    setIsGeneratingPlainText(true);
    addToast(t('Exporting Plain Text...'), 'info');
    try {
        await generatePlainTextFile(project, getArticleContent);
    } catch (error) {
        console.error("Plain text export failed:", error);
        addToast(t('Plain Text export failed.'), 'error');
    } finally {
        setIsGeneratingPlainText(false);
    }
  }, [project, getArticleContent, addToast, t]);

  const handleGenerateJsonWrapper = useCallback(async () => {
    setIsGeneratingJson(true);
    addToast(t('Exporting JSON...'), 'info');
    try {
        await onGenerateJson();
    } finally {
        setIsGeneratingJson(false);
    }
  }, [onGenerateJson, addToast, t]);

  const handleGenerateDocxWrapper = useCallback(async () => {
    setIsGeneratingDocx(true);
    addToast(t('Exporting DOCX...'), 'info');
    try {
        await onGenerateDocx();
    } finally {
        setIsGeneratingDocx(false);
    }
  }, [onGenerateDocx, addToast, t]);
  
  const aiEnabled = settings.library.aiAssistant.enabled && isAiConfigured;
  const aiDisabledTooltip = !isAiConfigured ? t('Invalid or missing API Key for Gemini. Please check your configuration.') : undefined;

  const fonts = {
    modern: { body: "'Inter', sans-serif" },
    classic: { body: "'Lora', serif" },
  };

  const previewStyles: React.CSSProperties = {
      fontFamily: fonts[pdfOptions.typography.fontPair].body,
      fontSize: `${pdfOptions.typography.fontSize}px`,
      lineHeight: pdfOptions.lineSpacing,
      columnCount: pdfOptions.layout === 'two' ? 2 : 1,
      columnGap: '2rem',
  };

  const renderContent = () => {
    if (isLoadingArticle) return <div className="flex justify-center items-center h-full"><Spinner /></div>
    
    switch (view) {
        case 'article':
            return activeArticleTitle && activeArticleContent !== null ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 relative">
                    <div className="flex justify-between items-start gap-4 mb-4 border-b pb-2 dark:border-gray-600">
                        <h2 className="text-3xl font-bold flex-grow">{activeArticleTitle}</h2>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                            <div className="relative" title={aiDisabledTooltip}>
                                <button onClick={analyze} disabled={isAnalyzing || !aiEnabled} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5">
                                    <Icon name="beaker" className="w-4 h-4" />
                                    {isAnalyzing ? t('Analyzing...') : t('Analyze Article')}
                                </button>
                            </div>
                            <button onClick={() => setIsCitationModalOpen(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center gap-1.5">
                                <Icon name="plus" className="w-4 h-4"/>
                                {t('Insert Citation')}
                            </button>
                             <button onClick={() => setView('settings')} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 text-sm font-semibold flex items-center gap-1.5">
                                <Icon name="settings" className="w-4 h-4"/>
                                {t('Settings & Export')}
                            </button>
                        </div>
                    </div>
                    <ArticleInsightsView insights={insights} isAnalyzing={isAnalyzing} analysisError={analysisError} />
                    <div style={previewStyles}>
                        <ArticleEditor
                            content={activeArticleContent}
                            onUpdate={handleContentUpdate}
                            editable={true}
                            onEditorCreated={handleEditorCreated}
                            placeholder={t('Editable article content for {{title}}', { title: activeArticleTitle })}
                        />
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-2 py-1 rounded-md">{t('Word Count: {{count}}', { count: articleWordCount })}</span>
                        <div title={aiDisabledTooltip}>
                            <button 
                                onClick={handleOpenAiEditor}
                                disabled={!aiEnabled}
                                className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                                aria-label={t('Edit with AI')}
                            >
                                <Icon name="sparkles" className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                </div>
            ) : null;
        case 'markdown':
            return (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 relative">
                    <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-600">
                      <h2 className="text-3xl font-bold">{project.name}</h2>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('Word Count: {{count}}', { count: totalWordCount })}</span>
                    </div>
                    {isGeneratingPreview
                        ? <div className="flex justify-center items-center h-full"><Spinner /></div>
                        : <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownPreview }} />
                    }
                </div>
            )
        case 'settings':
        default:
             return <CompilerExportSettings 
                project={project}
                updateProject={updateProject}
                settings={settings}
                updateSettings={updateSettings}
                pdfOptions={pdfOptions}
                onPdfOptionsChange={(path, value) => {
                    const keys = path.split('.');
                    const newOptions = JSON.parse(JSON.stringify(pdfOptions));
                    let current = newOptions;
                    for(let i=0; i<keys.length - 1; i++) {
                        current = current[keys[i]];
                    }
                    current[keys[keys.length-1]] = value;
                    setPdfOptions(newOptions);
                }}
                onGeneratePdf={onGeneratePdf}
                onGenerateMarkdown={handleGenerateMarkdownWrapper}
                onGenerateHtml={handleGenerateHtml}
                onGeneratePlainText={handleGeneratePlainText}
                onGenerateJson={handleGenerateJsonWrapper}
                onGenerateDocx={handleGenerateDocxWrapper}
                isGeneratingPdf={isGeneratingPdf}
                isGeneratingMarkdown={isGeneratingMarkdown}
                isGeneratingHtml={isGeneratingHtml}
                isGeneratingPlainText={isGeneratingPlainText}
                isGeneratingJson={isGeneratingJson}
                isGeneratingDocx={isGeneratingDocx}
             />
    }
  }

  return (
    <div className="md:col-span-7 lg:col-span-8 overflow-y-auto">
        <AIEditorModal
            isOpen={isAiEditorOpen}
            onClose={() => setIsAiEditorOpen(false)}
            onRunAiEdit={handleRunAiEdit}
            isEditing={isEditingWithAi}
            error={aiEditError}
            selectedText={aiEditorSelectedText}
        />
        <CitationModal 
            isOpen={isCitationModalOpen}
            onClose={() => setIsCitationModalOpen(false)}
            onInsert={handleInsertCitation}
            project={project}
            customCitations={settings.citations.customCitations}
        />
      <div className="flex items-center gap-2 border-b dark:border-gray-700 mb-4">
        <PaneToggleButton label={t('Settings & Export')} view="settings" currentView={view} setView={setView} />
        <PaneToggleButton label={t('Article Preview')} view="article" currentView={view} setView={setView} disabled={!activeArticleTitle} />
        <PaneToggleButton label={t('Markdown Preview')} view="markdown" currentView={view} setView={setView} disabled={project.articles.length === 0} />
      </div>
      {renderContent()}
    </div>
  );
};

const PaneToggleButton: React.FC<{label: string, view: RightPaneView, currentView: RightPaneView, setView: (view: RightPaneView) => void, disabled?: boolean}> = ({ label, view, currentView, setView, disabled = false }) => (
    <button
        onClick={() => setView(view)}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            currentView === view 
            ? 'border-accent-500 text-accent-600 dark:text-accent-400' 
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
        {label}
    </button>
);

const CitationModal: React.FC<{isOpen: boolean, onClose: () => void, onInsert: (key: string, text: string) => void, project: Project, customCitations: CustomCitation[]}> = ({ isOpen, onClose, onInsert, project, customCitations }) => {
    const { t } = useTranslation();
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('Insert Citation')} actions={<></>}>
            <div className="max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2">{t('Custom Sources')}</h3>
                <ul className="divide-y dark:divide-gray-700">
                    {customCitations.map(c => (
                        <li key={c.id} onClick={() => onInsert(c.key, `(${c.author}, ${c.year})`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md">
                            <span className="font-bold">{c.key}</span>: {c.title}
                        </li>
                    ))}
                </ul>
                <h3 className="text-lg font-semibold mt-4 mb-2">{t('Project Articles')}</h3>
                <ul className="divide-y dark:divide-gray-700">
                    {project.articles.map(a => (
                        <li key={a.title} onClick={() => onInsert(a.title, `(see ${a.title})`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md">
                            {a.title}
                        </li>
                    ))}
                </ul>
            </div>
        </Modal>
    )
};

export default memo(CompilerRightPanel);