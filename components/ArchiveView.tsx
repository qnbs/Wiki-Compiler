import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArticleContent, Project, ArticleInsights, AppSettings } from '../types';
import { getAllArticles, deleteArticleFromCache } from '../services/dbService';
import { useArticleAnalysis } from '../hooks/useArticleAnalysis';
import { useDebounce } from '../hooks/useDebounce';
import Icon from './Icon';
import Spinner from './Spinner';
import Modal from './Modal';
import ArticleInsightsView from './ArticleInsightsView';

interface ArchiveViewProps {
  addArticleToProject: (title: string) => void;
  getArticleContent: (title: string) => Promise<string>;
  activeProject: Project;
  settings: AppSettings;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ addArticleToProject, getArticleContent, activeProject, settings }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [allArticles, setAllArticles] = useState<ArticleContent[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleContent[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'az' | 'za'>('az');

  const { insights, isAnalyzing, analysisError, analyze, clearAnalysis } = useArticleAnalysis(selectedArticle, settings);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const articlesInProject = useMemo(() => 
    new Set(activeProject.articles.map(a => a.title)),
  [activeProject]);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    const articlesFromDb = await getAllArticles();
    setAllArticles(articlesFromDb);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    let filteredData = allArticles.filter(item =>
      item.title.toLowerCase().includes(lowercasedFilter)
    );
    
    filteredData.sort((a, b) => {
        if (sortOrder === 'az') {
            return a.title.localeCompare(b.title);
        } else {
            return b.title.localeCompare(a.title);
        }
    });

    setFilteredArticles(filteredData);
  }, [debouncedSearchTerm, allArticles, sortOrder]);

  const handleSelectArticle = useCallback(async (title: string) => {
    const article = allArticles.find(a => a.title === title);
    if(article) {
        setSelectedArticle(article);
        clearAnalysis();
    }
  }, [allArticles, clearAnalysis]);
  
  const handleQuickAdd = (title: string) => {
    addArticleToProject(title);
    setJustAdded(prev => new Set(prev).add(title));
    setTimeout(() => {
      setJustAdded(prev => {
        const next = new Set(prev);
        next.delete(title);
        return next;
      });
    }, 2000);
  };

  const handleDeleteArticle = (title: string) => {
    setArticleToDelete(title);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    await deleteArticleFromCache(articleToDelete);
    if (selectedArticle?.title === articleToDelete) {
        setSelectedArticle(null);
    }
    await loadArticles();
    setIsDeleteModalOpen(false);
    setArticleToDelete(null);
  };

  return (
    <>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('Delete from Archive')}
        actions={
          <>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
              {t('Cancel')}
            </button>
            <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
              {t('Delete from Archive')}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('Remove Article Confirmation', { articleTitle: articleToDelete })}
        </p>
      </Modal>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        {/* Search and Results Column */}
        <div className="md:col-span-4 lg:col-span-3 overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-4">
          <h2 className="text-2xl font-bold mb-4">{t('Article Archive')}</h2>
          <div className="relative mb-2">
            <input
              type="text"
              placeholder={t('Search Archive...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="mb-4 text-sm">
              <label htmlFor="sort-archive" className="font-medium text-gray-700 dark:text-gray-400 mr-2">{t('Sort by')}:</label>
              <select
                  id="sort-archive"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as 'az' | 'za')}
                  className="py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-1 focus:ring-accent-500 outline-none"
              >
                  <option value="az">{t('Title (A-Z)')}</option>
                  <option value="za">{t('Title (Z-A)')}</option>
              </select>
          </div>
          {isLoading && <Spinner />}
          {!isLoading && filteredArticles.length > 0 && (
              <ul className="space-y-2">
              {filteredArticles.map((article) => {
                  const isAdded = articlesInProject.has(article.title);
                  const wasJustAdded = justAdded.has(article.title);
                  return (
                      <li key={article.title}
                          className={`group p-3 rounded-lg transition-colors flex justify-between items-center ${selectedArticle?.title === article.title ? 'bg-accent-100 dark:bg-accent-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      >
                          <div onClick={() => handleSelectArticle(article.title)} className="cursor-pointer flex-grow truncate pr-2">
                             <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{article.title}</h3>
                             {article.metadata?.touched && (
                               <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {new Date(article.metadata.touched).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                               </p>
                             )}
                          </div>
                          <div className="flex-shrink-0 flex items-center">
                              <button
                                onClick={() => handleQuickAdd(article.title)}
                                disabled={isAdded}
                                aria-label={t('Quick Add to Compilation')}
                                className={`p-2 rounded-full transition-colors ${
                                  isAdded ? 'text-green-500' : 'text-gray-400 hover:bg-accent-100 dark:hover:bg-accent-900/50 hover:text-accent-600'
                                } disabled:text-green-500 disabled:cursor-default disabled:hover:bg-transparent dark:disabled:hover:bg-transparent`}
                              >
                                <Icon name={isAdded || wasJustAdded ? 'check' : 'plus'} className="w-5 h-5" />
                              </button>
                              <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.title); }}
                                  className="p-2 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500 transition-opacity"
                                  aria-label={t('Delete from Archive')}
                              >
                                  <Icon name="trash" className="w-5 h-5" />
                              </button>
                          </div>
                      </li>
                  )
                })}
              </ul>
          )}
          {!isLoading && filteredArticles.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <Icon name="archive-box" className="w-12 h-12 mx-auto mb-2" />
                  <p>{t('Your archive is empty.')}</p>
                  <p className="text-sm">{t('Viewed articles will appear here.')}</p>
              </div>
          )}
        </div>

        {/* Article View Column */}
        <div className="md:col-span-8 lg:col-span-9 overflow-y-auto">
          {selectedArticle && (
            <div className="relative">
              <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                   {settings.library.aiAssistant.enabled && (
                    <button
                        onClick={analyze}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Icon name="beaker" className="w-4 h-4"/>
                        {isAnalyzing ? t('Analyzing...') : t('Analyze with AI')}
                    </button>
                   )}
                  <button
                      onClick={() => addArticleToProject(selectedArticle.title)}
                      className="flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm font-semibold"
                  >
                      <Icon name="plus" className="w-4 h-4"/>
                      {t('Add to Compilation')}
                  </button>
              </div>
              <h2 className="text-3xl font-bold mb-4 border-b pb-2 dark:border-gray-600 pr-80">{selectedArticle.title}</h2>
              <ArticleInsightsView 
                insights={insights}
                isAnalyzing={isAnalyzing}
                analysisError={analysisError}
              />
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />
            </div>
          )}
          {!selectedArticle && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <Icon name="book" className="w-16 h-16 mb-4" />
              <p className="text-lg">{t('Select an article to read')}</p>
              <p>{t('or select one from the list.')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(ArchiveView);