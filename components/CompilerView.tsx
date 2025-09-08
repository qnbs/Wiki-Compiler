import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { marked } from 'marked';
import { Project, PdfOptions, ArticleContent, AppSettings, ArticleInsights } from '../types';
import { useArticleAnalysis } from '../hooks/useArticleAnalysis';
import Icon from './Icon';
import Spinner from './Spinner';
import { generatePdf, generateMarkdown, generateMarkdownContent } from '../services/exportService';
import CompilerSettings from './CompilerSettings';
import ArticleInsightsView from './ArticleInsightsView';


interface CompilerViewProps {
  project: Project;
  updateProject: (project: Project) => void;
  getArticleContent: (title: string) => Promise<string>;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
}

type RightPaneView = 'settings' | 'article' | 'markdown';

// --- Sub-components for Right Pane ---

const RightPaneSettings: React.FC<{
    projectName: string,
    onProjectNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onProjectNameBlur: () => void,
    pdfOptions: PdfOptions,
    setPdfOptions: React.Dispatch<React.SetStateAction<PdfOptions>>,
    handleGeneratePdf: () => void,
    handleGenerateMarkdown: () => void,
    analyze: () => void,
    handleSaveDefaults: () => void,
    isExporting: boolean,
    isAnalyzing: boolean,
    canGenerate: boolean,
    isArticleSelected: boolean
}> = ({
    projectName, onProjectNameChange, onProjectNameBlur, pdfOptions, setPdfOptions,
    handleGeneratePdf, handleGenerateMarkdown, analyze, handleSaveDefaults,
    isExporting, isAnalyzing, canGenerate, isArticleSelected
}) => {
    const { t } = useTranslation();
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">{t('Settings & Export')}</h2>
            <CompilerSettings
                projectName={projectName}
                onProjectNameChange={onProjectNameChange}
                onProjectNameBlur={onProjectNameBlur}
                pdfOptions={pdfOptions}
                setPdfOptions={setPdfOptions}
                onGeneratePdf={handleGeneratePdf}
                onGenerateMarkdown={handleGenerateMarkdown}
                onAnalyze={analyze}
                onSaveDefaults={handleSaveDefaults}
                isExporting={isExporting}
                isAnalyzing={isAnalyzing}
                canGenerate={canGenerate}
                isArticleSelected={isArticleSelected}
            />
        </div>
    );
};

const RightPaneArticlePreview: React.FC<{
    selectedArticle: ArticleContent,
    insights: ArticleInsights | null,
    isAnalyzing: boolean,
    analysisError: string | null
}> = ({ selectedArticle, insights, isAnalyzing, analysisError }) => {
    return (
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <h2 className="text-3xl font-bold mb-4 border-b pb-2 dark:border-gray-600">{selectedArticle.title}</h2>
            <ArticleInsightsView
                insights={insights}
                isAnalyzing={isAnalyzing}
                analysisError={analysisError}
            />
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />
        </div>
    );
};

const RightPaneMarkdownPreview: React.FC<{
    projectName: string,
    isGeneratingPreview: boolean,
    markdownPreview: string
}> = ({ projectName, isGeneratingPreview, markdownPreview }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <h2 className="text-3xl font-bold mb-4 border-b pb-2 dark:border-gray-600">{projectName}</h2>
            {isGeneratingPreview
                ? <div className="flex justify-center items-center h-full"><Spinner /></div>
                : <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownPreview }} />
            }
        </div>
    );
};


const CompilerView: React.FC<CompilerViewProps> = ({ project, updateProject, getArticleContent, settings, updateSettings }) => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState(project.articles);
  const [projectName, setProjectName] = useState(project.name);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);

  const [rightPaneView, setRightPaneView] = useState<RightPaneView>('settings');
  const [markdownPreview, setMarkdownPreview] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  
  const { insights, isAnalyzing, analysisError, analyze, clearAnalysis } = useArticleAnalysis(selectedArticle, settings);

  const [pdfOptions, setPdfOptions] = useState<PdfOptions>(settings.compiler.defaultPdfOptions);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setArticles(project.articles);
    setProjectName(project.name);
    // If the selected article is no longer in the project, deselect it and switch view.
    if (selectedArticle && !project.articles.some(a => a.title === selectedArticle.title)) {
      setSelectedArticle(null);
      setRightPaneView('settings');
    }
  }, [project, selectedArticle]);
  
  useEffect(() => {
    const generatePreview = async () => {
        if (rightPaneView === 'markdown' && project.articles.length > 0) {
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
  }, [rightPaneView, project, getArticleContent]);

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };
  
  const handleProjectNameBlur = () => {
    if (project.name !== projectName) {
      updateProject({...project, name: projectName});
    }
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newArticles = [...articles];
    const draggedItemContent = newArticles.splice(dragItem.current, 1)[0];
    newArticles.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setArticles(newArticles);
    updateProject({ ...project, articles: newArticles });
  };
  
  const removeArticle = (index: number) => {
      if (window.confirm(t('Remove Article Confirmation', { articleTitle: articles[index].title }))) {
        const newArticles = articles.filter((_, i) => i !== index);
        setArticles(newArticles);
        updateProject({...project, articles: newArticles});
      }
  };

  const moveArticle = (index: number, direction: 'up' | 'down') => {
    const newArticles = [...articles];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newArticles.length) return;
    
    [newArticles[index], newArticles[newIndex]] = [newArticles[newIndex], newArticles[index]];
    
    setArticles(newArticles);
    updateProject({ ...project, articles: newArticles });

    // Keep focus on the moved item
    setTimeout(() => {
        const itemToFocus = listRef.current?.children[newIndex] as HTMLLIElement | undefined;
        itemToFocus?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveArticle(index, 'up');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveArticle(index, 'down');
        }
    }
  };

  const handleSelectArticle = async (title: string) => {
    if (selectedArticle?.title === title) {
        setSelectedArticle(null);
        setRightPaneView('settings');
        return;
    }
    setIsLoadingArticle(true);
    setSelectedArticle(null);
    clearAnalysis();
    setRightPaneView('article');
    try {
        const html = await getArticleContent(title);
        setSelectedArticle({ title, html });
    } catch (error) {
        console.error("Failed to load article:", error);
        setRightPaneView('settings');
    }
    setIsLoadingArticle(false);
  };

  const handleGeneratePdf = useCallback(async () => {
    setIsExporting(true);
    setIsGeneratingPdf(true);
    try {
      await generatePdf(project, pdfOptions, getArticleContent);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("An error occurred during PDF generation.");
    } finally {
      setIsExporting(false);
      setIsGeneratingPdf(false);
    }
  }, [project, pdfOptions, getArticleContent]);

  const handleGenerateMarkdown = useCallback(async () => {
    setIsExporting(true);
    try {
      await generateMarkdown(project, getArticleContent);
    } catch (error) {
      console.error("Markdown generation failed:", error);
      alert("An error occurred during Markdown generation.");
    } finally {
      setIsExporting(false);
    }
  }, [project, getArticleContent]);

  const handleSaveDefaults = () => {
    if (window.confirm(t('Are you sure you want to overwrite your default export settings with the current ones?'))) {
        const newSettings = {
            ...settings,
            compiler: {
                ...settings.compiler,
                defaultPdfOptions: pdfOptions,
            }
        };
        updateSettings(newSettings);
        alert(t('Default settings have been updated.'));
    }
  };

  const renderRightPane = () => {
    if (isLoadingArticle) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>
    }
    
    switch (rightPaneView) {
        case 'article':
            return selectedArticle && (
                <RightPaneArticlePreview
                    selectedArticle={selectedArticle}
                    insights={insights}
                    isAnalyzing={isAnalyzing}
                    analysisError={analysisError}
                />
            );
        case 'markdown':
            return (
                <RightPaneMarkdownPreview
                    projectName={projectName}
                    isGeneratingPreview={isGeneratingPreview}
                    markdownPreview={markdownPreview}
                />
            )
        case 'settings':
        default:
             return (
                <RightPaneSettings
                    projectName={projectName}
                    onProjectNameChange={handleProjectNameChange}
                    onProjectNameBlur={handleProjectNameBlur}
                    pdfOptions={pdfOptions}
                    setPdfOptions={setPdfOptions}
                    handleGeneratePdf={handleGeneratePdf}
                    handleGenerateMarkdown={handleGenerateMarkdown}
                    analyze={analyze}
                    handleSaveDefaults={handleSaveDefaults}
                    isExporting={isExporting}
                    isAnalyzing={isAnalyzing}
                    canGenerate={articles.length > 0}
                    isArticleSelected={!!selectedArticle}
                />
             )
    }
  }

  return (
    <>
     {isGeneratingPdf && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex flex-col justify-center items-center" aria-live="assertive">
            <Spinner light />
            <p className="text-white text-lg mt-4">{t('Generating your PDF... This may take a moment.')}</p>
        </div>
      )}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Article List Column */}
      <div className="md:col-span-5 lg:col-span-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-4">
        <h2 className="text-2xl font-bold mb-4">{t('Compilation Articles')}</h2>
        {articles.length > 0 ? (
            <>
            <p id="reorder-instruction" className="sr-only">{t('Press Ctrl + Arrow Up or Down to reorder.')}</p>
            <ul ref={listRef} className="space-y-2" aria-roledescription="sortable list">
                {articles.map((article, index) => (
                <li
                    key={article.title}
                    tabIndex={0}
                    draggable
                    onDragStart={() => (dragItem.current = index)}
                    onDragEnter={() => (dragOverItem.current = index)}
                    onDragEnd={handleSort}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => handleSelectArticle(article.title)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-describedby="reorder-instruction"
                    className={`group flex items-center justify-between p-3 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 ${selectedArticle?.title === article.title ? 'bg-accent-100 dark:bg-accent-900/50 ring-2 ring-accent-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'} cursor-pointer`}
                >
                    <div className="flex items-center gap-3 truncate">
                    <Icon name="grip" className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                    <span className="font-medium truncate">{article.title}</span>
                    </div>
                    <div className="flex items-center flex-shrink-0 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); moveArticle(index, 'up'); }}
                            disabled={index === 0}
                            className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={t('Move article up', { articleTitle: article.title })}
                        >
                            <Icon name="arrow-up" className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); moveArticle(index, 'down'); }}
                            disabled={index === articles.length - 1}
                            className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={t('Move article down', { articleTitle: article.title })}
                        >
                            <Icon name="arrow-down" className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); removeArticle(index); }}
                            className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50"
                            aria-label={t('Remove article', { articleTitle: article.title })}
                        >
                            <Icon name="trash" className="w-5 h-5"/>
                        </button>
                    </div>
                </li>
                ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8 rounded-lg border-2 border-dashed dark:border-gray-700">
             <Icon name="compiler" className="w-12 h-12 mb-2"/>
            <p>{t('Your compilation is empty.')}</p>
            <p className="text-sm">{t('Go to the Library to add articles.')}</p>
          </div>
        )}
      </div>

      {/* Settings or Article Preview Column */}
      <div className="md:col-span-7 lg:col-span-8 overflow-y-auto">
        <div className="flex items-center gap-2 border-b dark:border-gray-700 mb-4">
             <PaneToggleButton label={t('Settings & Export')} view="settings" currentView={rightPaneView} setView={setRightPaneView} />
             <PaneToggleButton label={t('Article Preview')} view="article" currentView={rightPaneView} setView={setRightPaneView} disabled={!selectedArticle} />
             <PaneToggleButton label={t('Markdown Preview')} view="markdown" currentView={rightPaneView} setView={setRightPaneView} disabled={articles.length === 0} />
        </div>
        {renderRightPane()}
      </div>
    </div>
    </>
  );
};

interface PaneToggleButtonProps {
    label: string;
    view: RightPaneView;
    currentView: RightPaneView;
    setView: (view: RightPaneView) => void;
    disabled?: boolean;
}

const PaneToggleButton: React.FC<PaneToggleButtonProps> = ({ label, view, currentView, setView, disabled = false }) => (
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
)


export default memo(CompilerView);