import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArticleContent } from '../types';
import { getAllArticles, deleteArticleFromCache, clearArticleCache, saveArticleCache } from '../services/dbService';
import { getArticleHtml as fetchArticleHtml, getArticleMetadata } from '../services/wikipediaService';
import { isAiConfigured } from '../services/geminiService';
import { useArticleAnalysis } from '../hooks/useArticleAnalysis';
import { useDebounce } from '../hooks/useDebounce';
import Icon from './Icon';
import Spinner from './Spinner';
import Modal from './Modal';
import SkeletonLoader from './SkeletonLoader';
import ArticleInsightsView from './ArticleInsightsView';
import SlideOverPanel from './SlideOverPanel';
import { useSettings } from '../hooks/useSettingsContext';
import { useProjects } from '../hooks/useProjectsContext';
import { useToasts } from '../hooks/useToasts';
import { useClickOutside } from '../hooks/useClickOutside';
import { generateSingleArticleDocx, generateSingleArticleOdt } from '../services/exportService';

interface ArchiveItemProps {
  article: ArticleContent;
  isAdded: boolean;
  wasJustAdded: boolean;
  onSelect: (article: ArticleContent) => void;
  onQuickAdd: (title: string) => void;
  onDelete: (title: string) => void;
}

const ArchiveItem: React.FC<ArchiveItemProps> = memo(({ article, isAdded, wasJustAdded, onSelect, onQuickAdd, onDelete }) => {
  const { t } = useTranslation();
  return (
    <li
      onClick={() => onSelect(article)} 
      className="group p-3 rounded-lg transition-colors flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer shadow-sm border dark:border-gray-700"
    >
      <div className="flex-grow truncate pr-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{article.title}</h3>
        {article.metadata?.touched && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(article.metadata.touched).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onQuickAdd(article.title); }}
          disabled={isAdded}
          aria-label={t('Quick Add to Compilation')}
          title={t('Quick Add to Compilation') as string}
          className={`p-2 rounded-full transition-colors ${
            isAdded ? 'text-green-500' : 'text-gray-400 hover:bg-accent-100 dark:hover:bg-accent-900/50 hover:text-accent-600'
          } disabled:text-green-500 disabled:cursor-not-allowed`}
        >
          <Icon name={isAdded || wasJustAdded ? 'check' : 'plus'} className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(article.title); }}
          className="p-2 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600"
          aria-label={t('Delete from Archive')}
          title={t('Delete from Archive') as string}
        >
          <Icon name="trash" className="w-5 h-5" />
        </button>
      </div>
    </li>
  );
});

const ArchiveView: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { activeProject, addArticleToProject } = useProjects();
  const { addToast } = useToasts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [allArticles, setAllArticles] = useState<ArticleContent[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleContent[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'az' | 'za' | 'date_newest' | 'date_oldest'>('az');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const exportMenuRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(exportMenuRef, () => setIsExportMenuOpen(false));

  const { insights, isAnalyzing, analysisError, analyze, clearAnalysis } = useArticleAnalysis(selectedArticle);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const articlesInProject = useMemo(() => new Set(activeProject?.articles.map(a => a.title)), [activeProject]);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    const articlesFromDb = await getAllArticles();
    setAllArticles(articlesFromDb);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  useEffect(() => {
    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    let filteredData = allArticles.filter(item => item.title.toLowerCase().includes(lowercasedFilter));
    filteredData.sort((a, b) => {
        if (sortOrder.startsWith('date')) {
            const dateA = a.metadata?.touched ? new Date(a.metadata.touched).getTime() : 0;
            const dateB = b.metadata?.touched ? new Date(b.metadata.touched).getTime() : 0;
            return sortOrder === 'date_newest' ? dateB - dateA : dateA - dateB;
        }
        return sortOrder === 'az' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    });
    setFilteredArticles(filteredData);
  }, [debouncedSearchTerm, allArticles, sortOrder]);

  const handleSelectArticle = useCallback((article: ArticleContent) => {
    setSelectedArticle(article);
    clearAnalysis();
  }, [clearAnalysis]);

  const handleQuickAdd = (title: string) => {
    addArticleToProject(title);
    setJustAdded(prev => new Set(prev).add(title));
    setTimeout(() => {
      setJustAdded(prev => { const next = new Set(prev); next.delete(title); return next; });
    }, 2000);
  };

  const handleDeleteArticle = (title: string) => {
    setArticleToDelete(title);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    await deleteArticleFromCache(articleToDelete);
    if (selectedArticle?.title === articleToDelete) setSelectedArticle(null);
    await loadArticles();
    setIsDeleteModalOpen(false);
    setArticleToDelete(null);
  };

  const confirmClear = async () => {
    await clearArticleCache();
    setSelectedArticle(null);
    await loadArticles();
    setIsClearModalOpen(false);
    addToast(t('Cache cleared successfully!'), 'success');
  }

  const handleRefreshContent = async () => {
    if (!selectedArticle) return;
    setIsRefreshing(true);
    try {
        const html = await fetchArticleHtml(selectedArticle.title);
        const metadataArray = await getArticleMetadata([selectedArticle.title]);
        const articleToCache: ArticleContent = { 
            title: selectedArticle.title, 
            html, 
            metadata: metadataArray.length > 0 ? metadataArray[0] : undefined 
        };
        await saveArticleCache(articleToCache);
        setSelectedArticle(articleToCache); // Update the view immediately
        setAllArticles(prev => prev.map(a => a.title === articleToCache.title ? articleToCache : a));
        addToast(t('Article "{{title}}" has been updated to the latest version.', { title: selectedArticle.title }), 'success');
    } catch (error) {
        console.error("Failed to refresh article:", error);
        addToast("Failed to refresh article.", "error");
    } finally {
        setIsRefreshing(false);
    }
  }

  if (!settings) return <Spinner />;

  const aiEnabled = settings.library.aiAssistant.enabled && isAiConfigured;
  const isSelectedArticleInProject = selectedArticle ? articlesInProject.has(selectedArticle.title) : false;

  return (
    <>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('Delete from Archive')} actions={
          <>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">{t('Cancel')}</button>
            <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">{t('Delete')}</button>
          </>
      }><p className="text-sm text-gray-600 dark:text-gray-300">{t('Remove Article from Archive Confirmation', { articleTitle: articleToDelete })}</p></Modal>
      
      <Modal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} title={t('Clear Archive')} actions={
          <>
            <button onClick={() => setIsClearModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">{t('Cancel')}</button>
            <button onClick={confirmClear} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">{t('Delete All')}</button>
          </>
      }><p className="text-sm text-gray-600 dark:text-gray-300">{t('Are you sure you want to delete all articles from your archive? This action cannot be undone.')}</p></Modal>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{t('Article Archive')}</h1>
            {allArticles.length > 0 && (
                <button onClick={() => setIsClearModalOpen(true)} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400">
                    <Icon name="trash" className="w-4 h-4" /> {t('Clear Archive')}
                </button>
            )}
        </div>
        <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-grow">
                <input type="text" placeholder={t('Search Archive...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-accent-500"/>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="search" className="w-5 h-5 text-gray-400" /></div>
            </div>
            <div>
                <label htmlFor="sort-archive" className="sr-only">{t('Sort by')}:</label>
                <select id="sort-archive" value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="py-2.5 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-1 focus:ring-accent-500">
                    <option value="az">{t('Title (A-Z)')}</option>
                    <option value="za">{t('Title (Z-A)')}</option>
                    <option value="date_newest">{t('Date (Newest)')}</option>
                    <option value="date_oldest">{t('Date (Oldest)')}</option>
                </select>
            </div>
        </div>

        {isLoading && <SkeletonLoader />}
        {!isLoading && filteredArticles.length > 0 && (
            <ul className="space-y-3">
            {filteredArticles.map((article) => (
                <ArchiveItem key={article.title} article={article} isAdded={articlesInProject.has(article.title)} wasJustAdded={justAdded.has(article.title)} onSelect={handleSelectArticle} onQuickAdd={handleQuickAdd} onDelete={handleDeleteArticle} />
            ))}
            </ul>
        )}
        {!isLoading && allArticles.length > 0 && filteredArticles.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8"><p>{t('No results found for \"{{term}}\"', { term: debouncedSearchTerm })}</p></div>
        )}
        {!isLoading && allArticles.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-16">
                <Icon name="archive-box" className="w-16 h-16 mx-auto mb-2" />
                <p className="text-lg">{t('Your archive is empty.')}</p>
                <p>{t('Viewed articles will appear here.')}</p>
            </div>
        )}
      </div>

      <SlideOverPanel isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} title={selectedArticle?.title || ''}>
        {selectedArticle && (
            <>
                <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex flex-wrap items-center gap-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <button onClick={analyze} disabled={isAnalyzing || !aiEnabled} className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-sm disabled:bg-gray-400">
                        <Icon name="beaker" className="w-4 h-4"/>{isAnalyzing ? t('Analyzing...') : t('Analyze with AI')}
                    </button>
                    <button onClick={() => handleQuickAdd(selectedArticle.title)} disabled={isSelectedArticleInProject} className="flex items-center gap-2 bg-accent-600 text-white px-3 py-1.5 rounded-lg hover:bg-accent-700 text-sm disabled:bg-gray-400">
                        <Icon name={isSelectedArticleInProject ? 'check' : 'plus'} className="w-4 h-4"/>{t('Add to Compilation')}
                    </button>
                    <button onClick={handleRefreshContent} disabled={isRefreshing} className="flex items-center gap-2 bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 text-sm disabled:bg-gray-400">
                        {isRefreshing ? <Spinner light/> : <Icon name="arrow-down" className="w-4 h-4"/>} {t('Refresh Content')}
                    </button>
                    <div className="relative" ref={exportMenuRef}>
                       <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="flex items-center gap-2 bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 text-sm">
                           <Icon name="download" className="w-4 h-4"/>{t('Export')} <Icon name="chevron-down" className="w-4 h-4"/>
                       </button>
                       {isExportMenuOpen && (
                           <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-20">
                               <button onClick={() => generateSingleArticleDocx(selectedArticle.title, selectedArticle.html)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Export as DOCX</button>
                               <button onClick={() => generateSingleArticleOdt(selectedArticle.title, selectedArticle.html)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Export as ODT</button>
                           </div>
                       )}
                    </div>
                </div>
                <div className="p-4 sm:p-6 lg:p-8">
                    <ArticleInsightsView insights={insights} isAnalyzing={isAnalyzing} analysisError={analysisError} />
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />
                </div>
            </>
        )}
      </SlideOverPanel>
    </>
  );
};

export default memo(ArchiveView);