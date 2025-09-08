import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'https://esm.sh/react-i18next@14.1.2';
import { Project, PdfOptions, ArticleContent, AppSettings, ArticleInsights } from '../types';
import { getArticleInsights } from '../services/geminiService';
import Icon from './Icon';
import Spinner from './Spinner';
import { generatePdf, generateMarkdown } from '../services/exportService';
import CompilerSettings from './CompilerSettings';
import ArticleInsightsView from './ArticleInsightsView';


interface CompilerViewProps {
  project: Project;
  updateProject: (project: Project) => void;
  getArticleContent: (title: string) => Promise<string>;
  settings: AppSettings;
}

const CompilerView: React.FC<CompilerViewProps> = ({ project, updateProject, getArticleContent, settings }) => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState(project.articles);
  const [projectName, setProjectName] = useState(project.name);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(true);
  const [insights, setInsights] = useState<ArticleInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [pdfOptions, setPdfOptions] = useState<PdfOptions>(settings.compiler.defaultPdfOptions);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
      setArticles(project.articles);
      setProjectName(project.name);
      // If the selected article is no longer in the project, deselect it.
      if (selectedArticle && !project.articles.some(a => a.title === selectedArticle.title)) {
        setSelectedArticle(null);
      }
  }, [project, selectedArticle]);

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
  };

  const handleSelectArticle = async (title: string) => {
    if (selectedArticle?.title === title) {
        setSelectedArticle(null);
        return;
    }
    setIsLoadingArticle(true);
    setSelectedArticle(null);
    setInsights(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    try {
        const html = await getArticleContent(title);
        setSelectedArticle({ title, html });
    } catch (error) {
        console.error("Failed to load article:", error);
    }
    setIsLoadingArticle(false);
  };

  const handleAnalyzeSelectedArticle = async () => {
    if (!selectedArticle) return;
    
    setIsAnalyzing(true);
    setInsights(null);
    setAnalysisError(null);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = selectedArticle.html;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    try {
        const resultInsights = await getArticleInsights(textContent, settings.library.aiAssistant.systemInstruction);
        setInsights(resultInsights);
    } catch (error) {
        console.error("Analysis failed:", error);
        setAnalysisError(error instanceof Error ? error.message : String(error));
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleGeneratePdf = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generatePdf(project, pdfOptions, getArticleContent);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("An error occurred during PDF generation.");
    } finally {
      setIsGenerating(false);
    }
  }, [project, pdfOptions, getArticleContent]);

  const handleGenerateMarkdown = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generateMarkdown(project, getArticleContent);
    } catch (error) {
      console.error("Markdown generation failed:", error);
      alert("An error occurred during Markdown generation.");
    } finally {
      setIsGenerating(false);
    }
  }, [project, getArticleContent]);

  const settingsPanel = (
    <CompilerSettings
      projectName={projectName}
      onProjectNameChange={handleProjectNameChange}
      onProjectNameBlur={handleProjectNameBlur}
      pdfOptions={pdfOptions}
      setPdfOptions={setPdfOptions}
      onGeneratePdf={handleGeneratePdf}
      onGenerateMarkdown={handleGenerateMarkdown}
      isGenerating={isGenerating}
      canGenerate={articles.length > 0}
      onAnalyze={handleAnalyzeSelectedArticle}
      isAnalyzing={isAnalyzing}
      isArticleSelected={!!selectedArticle}
    />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Article List Column */}
      <div className="md:col-span-5 lg:col-span-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-4">
        <h2 className="text-2xl font-bold mb-4">{t('Compilation Articles')}</h2>
        {articles.length > 0 ? (
          <ul className="space-y-2">
            {articles.map((article, index) => (
              <li
                key={article.title}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => handleSelectArticle(article.title)}
                className={`group flex items-center justify-between p-3 rounded-lg shadow-sm transition-colors ${selectedArticle?.title === article.title ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'} cursor-pointer`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon name="grip" className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                  <span className="font-medium truncate">{article.title}</span>
                </div>
                <div className="flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
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
        {isLoadingArticle && <div className="flex justify-center items-center h-full"><Spinner /></div>}
        
        {!isLoadingArticle && !selectedArticle && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">{t('Settings & Export')}</h2>
            {settingsPanel}
          </div>
        )}

        {!isLoadingArticle && selectedArticle && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              <button
                onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
                className="w-full flex justify-between items-center p-4"
                aria-expanded={!isSettingsCollapsed}
                aria-controls="export-settings-panel"
              >
                <h3 className="text-xl font-semibold">{t('Settings & Export')}</h3>
                <Icon name="chevron-down" className={`w-5 h-5 transition-transform duration-200 ${isSettingsCollapsed ? '' : 'rotate-180'}`} />
              </button>
              {!isSettingsCollapsed && (
                <div id="export-settings-panel" className="p-6 border-t border-gray-200 dark:border-gray-700">
                  {settingsPanel}
                </div>
              )}
            </div>

            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
              <h2 className="text-3xl font-bold mb-4 border-b pb-2 dark:border-gray-600">{selectedArticle.title}</h2>
              <ArticleInsightsView
                insights={insights}
                isAnalyzing={isAnalyzing}
                analysisError={analysisError}
              />
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompilerView;