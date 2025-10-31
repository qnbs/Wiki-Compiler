import React from 'react';
import { useLibraryContext } from '../../hooks/useLibraryContext';
import Icon from '../Icon';
import SkeletonLoader from '../SkeletonLoader';
import ArticleInsightsView from '../ArticleInsightsView';
import { isAiConfigured } from '../../services/geminiService';

const LibraryArticlePanel: React.FC = () => {
    const {
        t,
        isLoadingArticle,
        selectedArticle,
        analyze,
        isAnalyzing,
        addArticleToProject,
        articlesInProject,
        settings,
        insights,
        analysisError
    } = useLibraryContext();

    if (!settings) return null;

    const aiEnabled = settings.library.aiAssistant.enabled && isAiConfigured;
    const isSelectedArticleInProject = selectedArticle ? articlesInProject.has(selectedArticle.title) : false;

    return (
        <div className="md:col-span-8 lg:col-span-9 overflow-y-auto">
            {isLoadingArticle && <SkeletonLoader />}
            {!isLoadingArticle && selectedArticle && (
                <div>
                    <div className="flex justify-between items-start gap-4 mb-4 border-b pb-2 dark:border-gray-600">
                        <h2 className="text-3xl font-bold flex-grow">{selectedArticle.title}</h2>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="relative" title={!aiEnabled ? t('Invalid or missing API Key for Gemini. Please check your configuration.') : undefined}>
                                <button
                                    onClick={analyze}
                                    disabled={isAnalyzing || !aiEnabled}
                                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <Icon name="beaker" className="w-4 h-4"/>
                                    {isAnalyzing ? t('Analyzing...') : t('Analyze with AI')}
                                </button>
                            </div>
                            <button
                                onClick={() => addArticleToProject(selectedArticle.title)}
                                disabled={isSelectedArticleInProject}
                                className="flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Icon name={isSelectedArticleInProject ? 'check' : 'plus'} className="w-4 h-4"/>
                                {t('Add to Compilation')}
                            </button>
                        </div>
                    </div>
                    
                    <ArticleInsightsView 
                        insights={insights}
                        isAnalyzing={isAnalyzing}
                        analysisError={analysisError}
                        onAddToProject={() => addArticleToProject(selectedArticle.title)}
                        isArticleInProject={isSelectedArticleInProject}
                    />

                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />
                </div>
            )}
            {!isLoadingArticle && !selectedArticle && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                    <Icon name="book" className="w-16 h-16 mb-4" />
                    <p className="text-lg">{t('Search for an article to begin')}</p>
                    <p>{t('or select one from the list.')}</p>
                </div>
            )}
        </div>
    );
};

export default LibraryArticlePanel;
