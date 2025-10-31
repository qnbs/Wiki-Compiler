import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useArchiveContext } from '../../hooks/useArchiveContext';
import { useSettings } from '../../hooks/useSettingsContext';
import { isAiConfigured } from '../../services/geminiService';
import { generateSingleArticleDocx, generateSingleArticleOdt } from '../../services/exportService';
import { useClickOutside } from '../../hooks/useClickOutside';
import Icon from '../Icon';
import Spinner from '../Spinner';
import ArticleInsightsView from '../ArticleInsightsView';

const ArchiveArticlePanel: React.FC = () => {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const {
        selectedArticle,
        insights,
        isAnalyzing,
        analysisError,
        analyze,
        handleRefreshContent,
        isRefreshing,
        handleQuickAdd,
        articlesInProject,
    } = useArchiveContext();
    
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    useClickOutside(exportMenuRef, () => setIsExportMenuOpen(false));
    
    if (!settings) return null;

    const aiEnabled = settings.library.aiAssistant.enabled && isAiConfigured;
    const isSelectedArticleInProject = selectedArticle ? articlesInProject.has(selectedArticle.title) : false;

    if (!selectedArticle) {
        return (
            <div className="md:col-span-8 lg:col-span-9 flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <Icon name="archive-box" className="w-16 h-16 mb-4" />
                <p className="text-lg">{t('Select an article to read')}</p>
            </div>
        );
    }

    return (
        <div className="md:col-span-8 lg:col-span-9 overflow-y-auto">
            <div>
                <div className="flex justify-between items-start gap-4 mb-4 border-b pb-2 dark:border-gray-600">
                    <h2 className="text-3xl font-bold flex-grow">{selectedArticle.title}</h2>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="relative" ref={exportMenuRef}>
                           <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="flex items-center gap-2 bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 text-sm">
                               <Icon name="download" className="w-4 h-4"/>{t('Export')}
                           </button>
                           {isExportMenuOpen && (
                               <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-20">
                                   <button onClick={() => generateSingleArticleDocx(selectedArticle.title, selectedArticle.html)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Export as DOCX</button>
                                   <button onClick={() => generateSingleArticleOdt(selectedArticle.title, selectedArticle.html)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Export as ODT</button>
                               </div>
                           )}
                        </div>
                    </div>
                </div>
                 <div className="p-1 space-y-4">
                     <div className="flex flex-wrap items-center gap-2">
                        <button onClick={analyze} disabled={isAnalyzing || !aiEnabled} className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-sm disabled:bg-gray-400">
                            <Icon name="beaker" className="w-4 h-4"/>{isAnalyzing ? t('Analyzing...') : t('Analyze with AI')}
                        </button>
                        <button onClick={() => handleQuickAdd(selectedArticle.title)} disabled={isSelectedArticleInProject} className="flex items-center gap-2 bg-accent-600 text-white px-3 py-1.5 rounded-lg hover:bg-accent-700 text-sm disabled:bg-gray-400">
                            <Icon name={isSelectedArticleInProject ? 'check' : 'plus'} className="w-4 h-4"/>{t('Add to Compilation')}
                        </button>
                        <button onClick={handleRefreshContent} disabled={isRefreshing} className="flex items-center gap-2 bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 text-sm disabled:bg-gray-400">
                            {isRefreshing ? <Spinner light/> : <Icon name="download" className="w-4 h-4"/>} {t('Refresh Content')}
                        </button>
                    </div>
                    <ArticleInsightsView insights={insights} isAnalyzing={isAnalyzing} analysisError={analysisError} />
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />
                </div>
            </div>
        </div>
    );
};

export default ArchiveArticlePanel;
