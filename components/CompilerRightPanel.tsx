import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
// Fix: The Editor type is exported from '@tiptap/core', not '@tiptap/react'.
import type { Editor } from '@tiptap/core';

import { Project, PdfOptions, AppSettings, CustomCitation, ProjectArticleContent } from '../types';
import { RightPaneView } from './CompilerView';
import { useArticleAnalysis } from '../hooks/useArticleAnalysis';
import { useDebounce } from '../hooks/useDebounce';
import { getProjectArticleContent, saveProjectArticleContent } from '../services/dbService';
import { editTextWithAi } from '../services/geminiService';
import { generateMarkdownContent } from '../services/exportService';
import { useToasts } from '../hooks/useToasts';

import Icon from './Icon';
import Spinner from './Spinner';
import Modal from './Modal';
import AIEditorModal from './AIEditorModal';
import ArticleInsightsView from './ArticleInsightsView';
import ArticleEditor from './ArticleEditor';

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
  isGeneratingPdf: boolean;
}

const ExportSettingsPanel: React.FC<{
    project: Project;
    updateProject: (project: Project) => void;
    pdfOptions: PdfOptions;
    setPdfOptions: React.Dispatch<React.SetStateAction<PdfOptions>>;
    onGeneratePdf: () => void;
    onGenerateMarkdown: () => void;
    onSaveDefaults: () => void;
    isGeneratingPdf: boolean;
}> = ({ project, updateProject, pdfOptions, setPdfOptions, onGeneratePdf, onGenerateMarkdown, onSaveDefaults, isGeneratingPdf }) => {
    const { t } = useTranslation();

    const set = (path: string, value: any) => {
        setPdfOptions(prev => {
            const newOptions = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current: any = newOptions;
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newOptions;
        });
    };

    return (
      <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm space-y-8">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Document Title')}</label>
            <input type="text" value={project.name} onChange={e => updateProject({ ...project, name: e.target.value })} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
        </div>
        <div className="space-y-8">
            <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Layout')}</legend>
               <div className="space-y-4 pl-2 mt-2">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Paper Size')}</label>
                       <select value={pdfOptions.paperSize} onChange={e => set('paperSize', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="letter">{t('Letter')}</option>
                           <option value="a4">{t('A4')}</option>
                       </select>
                   </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Columns')}</label>
                        <select value={pdfOptions.layout} onChange={e => set('layout', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="single">{t('Single Column')}</option>
                           <option value="two">{t('Two Column')}</option>
                       </select>
                   </div>
               </div>
           </fieldset>

           <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Page Setup')}</legend>
               <div className="space-y-4 pl-2 mt-2">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Margins')}</label>
                       <select value={pdfOptions.margins} onChange={e => set('margins', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="normal">{t('Normal')}</option>
                           <option value="narrow">{t('Narrow')}</option>
                           <option value="wide">{t('Wide')}</option>
                       </select>
                   </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Line Spacing')}</label>
                       <select value={pdfOptions.lineSpacing} onChange={e => set('lineSpacing', parseFloat(e.target.value))} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="1.15">{t('Single (1.15)')}</option>
                           <option value="1.5">{t('One and a half (1.5)')}</option>
                           <option value="2.0">{t('Double (2.0)')}</option>
                       </select>
                   </div>
               </div>
           </fieldset>

           <fieldset>
                <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Header Content')}</legend>
                <div className="space-y-4 pl-2 mt-2">
                    <div>
                        <select value={pdfOptions.headerContent} onChange={e => set('headerContent', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option value="none">{t('None')}</option>
                            <option value="title">{t('Document Title')}</option>
                            <option value="custom">{t('Custom')}</option>
                        </select>
                        {pdfOptions.headerContent === 'custom' && (
                            <input type="text" value={pdfOptions.customHeaderText || ''} onChange={e => set('customHeaderText', e.target.value)} placeholder={t('Custom Header Text')} className="mt-2 w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"/>
                        )}
                    </div>
                </div>
           </fieldset>
            
           <fieldset>
                <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Footer Content')}</legend>
                <div className="space-y-4 pl-2 mt-2">
                    <div>
                        <select value={pdfOptions.footerContent} onChange={e => set('footerContent', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option value="none">{t('None')}</option>
                            <option value="pageNumber">{t('Page Number')}</option>
                            <option value="custom">{t('Custom')}</option>
                        </select>
                        {pdfOptions.footerContent === 'custom' && (
                            <input type="text" value={pdfOptions.customFooterText || ''} onChange={e => set('customFooterText', e.target.value)} placeholder={t('Custom Footer Text')} className="mt-2 w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"/>
                        )}
                    </div>
                </div>
           </fieldset>
           
           <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Typography')}</legend>
               <div className="space-y-4 pl-2 mt-2">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Font Pairing')}</label>
                       <select value={pdfOptions.typography.fontPair} onChange={e => set('typography.fontPair', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option value="modern">{t('Modern (Inter)')}</option>
                            <option value="classic">{t('Classic (Lora)')}</option>
                        </select>
                   </div>
                   <div>
                        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('Base Font Size')}: <span className="font-bold">{pdfOptions.typography.fontSize}px</span>
                        </label>
                        <input type="range" id="fontSize" min="10" max="24" step="1" value={pdfOptions.typography.fontSize} onChange={e => set('typography.fontSize', parseInt(e.target.value, 10))} className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                   </div>
               </div>
           </fieldset>
           
            <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Content')}</legend>
              <div className="space-y-4 pl-2 mt-2">
                    <div className="flex items-center">
                        <input id="includeTOC" type="checkbox" checked={pdfOptions.includeTOC} onChange={e => set('includeTOC', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                        <label htmlFor="includeTOC" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Include Table of Contents')}</label>
                    </div>
                  <div>
                      <div className="flex items-center">
                          <input id="includeBibliography" type="checkbox" checked={pdfOptions.includeBibliography} onChange={e => set('includeBibliography', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                          <label htmlFor="includeBibliography" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Include Bibliography')}</label>
                      </div>
                      {pdfOptions.includeBibliography && (
                          <div className="pl-6 mt-2">
                               <select value={pdfOptions.citationStyle} onChange={e => set('citationStyle', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                   <option value="apa">{t('APA')}</option>
                                   <option value="mla">{t('MLA')}</option>
                               </select>
                          </div>
                      )}
                  </div>
               </div>
            </fieldset>

            <div className="border-t dark:border-gray-700 pt-6 space-y-4">
                <div>
                     <button onClick={onSaveDefaults} className="w-full text-left text-sm text-accent-600 dark:text-accent-400 hover:underline">{t('Save as Default Settings')}</button>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{t('Save the current export options as the new default for all future projects.')}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={onGeneratePdf} disabled={isGeneratingPdf} className="flex-1 flex items-center justify-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors font-semibold disabled:bg-gray-400">
                        {isGeneratingPdf ? <Spinner light /> : <Icon name="download" className="w-5 h-5" />}
                        {isGeneratingPdf ? t('Generating PDF...') : t('Generate PDF')}
                    </button>
                    <button onClick={onGenerateMarkdown} disabled={isGeneratingPdf} className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold disabled:bg-gray-400">
                        <Icon name="document" className="w-5 h-5" />
                        {t('Export Markdown')}
                    </button>
                </div>
            </div>
          </div>
      </div>
    );
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

  const [isAiEditorOpen, setIsAiEditorOpen] = useState(false);
  const [isEditingWithAi, setIsEditingWithAi] = useState(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const { insights, isAnalyzing, analysisError, analyze, clearAnalysis } = useArticleAnalysis(
    activeArticleTitle && activeArticleContent ? { title: activeArticleTitle, html: activeArticleContent } : null
  );
  
  const [pdfOptions, setPdfOptions] = useState<PdfOptions>(settings.compiler.defaultPdfOptions);

  // Fix: This callback receives the editor instance from the child component.
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
          setActiveArticleContent(modifiedContent ? modifiedContent.html : await getArticleContent(activeArticleTitle));
        } catch (error) {
          console.error("Failed to load article:", error);
          addToast('Failed to load article content.', 'error');
          setView('settings');
        } finally {
          setIsLoadingArticle(false);
        }
      } else {
        setActiveArticleContent(null);
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
    setIsDirty(true);
  };
  
  const handleInsertCitation = (key: string, text: string) => {
    if (!editorInstance) return;
    const citationHtml = `<cite data-citation-key="${key}">${text}</cite>`;
    editorInstance.chain().focus().insertContent(citationHtml).run();
    setIsCitationModalOpen(false);
  };

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
    } catch (error) {
      setAiEditError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsEditingWithAi(false);
      setIsAiEditorOpen(false);
    }
  };
  
  const handleSaveDefaults = () => {
    if (window.confirm(t('Are you sure you want to overwrite your default export settings with the current ones?'))) {
        const newSettings = { ...settings, compiler: { ...settings.compiler, defaultPdfOptions: pdfOptions } };
        updateSettings(newSettings);
        addToast(t('Default settings updated successfully.'), 'success');
    }
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
                            {settings.library.aiAssistant.enabled && (
                                <button onClick={analyze} disabled={isAnalyzing} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5">
                                    <Icon name="beaker" className="w-4 h-4" />
                                    {isAnalyzing ? t('Analyzing...') : t('Analyze Article')}
                                </button>
                            )}
                            <button onClick={() => setIsCitationModalOpen(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-semibold">
                                {t('Insert Citation')}
                            </button>
                        </div>
                    </div>
                    <ArticleInsightsView insights={insights} isAnalyzing={isAnalyzing} analysisError={analysisError} />
                    <ArticleEditor
                        content={activeArticleContent}
                        onUpdate={handleContentUpdate}
                        editable={true}
                        onEditorCreated={handleEditorCreated}
                    />
                     <button 
                        onClick={() => setIsAiEditorOpen(true)}
                        className="absolute bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800"
                        aria-label={t('Edit with AI')}
                        title={t('Edit with AI')}
                    >
                        <Icon name="sparkles" className="w-6 h-6"/>
                    </button>
                </div>
            ) : null;
        case 'markdown':
            return (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                    <h2 className="text-3xl font-bold mb-4 border-b pb-2 dark:border-gray-600">{project.name}</h2>
                    {isGeneratingPreview
                        ? <div className="flex justify-center items-center h-full"><Spinner /></div>
                        : <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownPreview }} />
                    }
                </div>
            )
        case 'settings':
        default:
             return <ExportSettingsPanel 
                project={project}
                updateProject={updateProject}
                pdfOptions={pdfOptions}
                setPdfOptions={setPdfOptions}
                onGeneratePdf={() => onGeneratePdf(pdfOptions)}
                onGenerateMarkdown={onGenerateMarkdown}
                onSaveDefaults={handleSaveDefaults}
                isGeneratingPdf={isGeneratingPdf}
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
