# Wiki Compiler: Quellcode-Dokumentation (Teil 4: Ansichtskomponenten)

Dieses Dokument enthält den Quellcode für die Haupt-Ansichtskomponenten (`Views`). Jede dieser Komponenten repräsentiert eine der Hauptseiten der Anwendung.

---

## `components/LibraryView.tsx`

```typescript
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useDebounce';
import { SearchResult, ArticleContent } from '../types';
import { searchArticles } from '../services/wikipediaService';
import { isAiConfigured } from '../services/geminiService';
import { useArticleAnalysis } from '../hooks/useArticleAnalysis';
import Icon from './Icon';
import Spinner from './Spinner';
import SkeletonLoader from './SkeletonLoader';
import ArticleInsightsView from './ArticleInsightsView';
import { useSettings } from '../hooks/useSettingsContext';
import { useProjects } from '../hooks/useProjectsContext';
import { useImporter } from '../hooks/useImporterContext';
import { useToasts } from '../hooks/useToasts';

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  isAddedToProject: boolean;
  isAddedToImporter: boolean;
  onSelect: (title: string) => void;
  onAddToImporter: (title: string, html: string) => void;
  onAddToProject: (title: string) => void;
  getArticle: (title: string) => Promise<string>;
  style: React.CSSProperties;
}

const SearchResultItem: React.FC<SearchResultItemProps> = memo(({ result, isSelected, isAddedToProject, isAddedToImporter, onSelect, onAddToImporter, onAddToProject, getArticle, style }) => {
  const { t } = useTranslation();

  const handleAddToImporter = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const html = await getArticle(result.title);
    onAddToImporter(result.title, html);
  };

  return (
    <li
      style={style}
      className={`group p-3 rounded-lg transition-colors flex justify-between items-center animate-fade-in ${isSelected ? 'bg-accent-100 dark:bg-accent-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <div onClick={() => onSelect(result.title)} className="cursor-pointer flex-grow truncate pr-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{result.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{result.snippet}</p>
        {result.timestamp && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(result.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
      <button
        onClick={handleAddToImporter}
        disabled={isAddedToImporter}
        aria-label={t('Add to Importer')}
        className={`flex-shrink-0 p-2 rounded-full transition-colors ${
          isAddedToImporter ? 'text-green-500' : 'text-gray-400 hover:bg-accent-100 dark:hover:bg-accent-900/50 hover:text-accent-600'
        } disabled:text-green-500 disabled:cursor-default disabled:hover:bg-transparent dark:disabled:hover:bg-transparent`}
      >
        <Icon name={isAddedToImporter ? 'check' : 'upload'} className={`w-5 h-5 ${isAddedToImporter ? 'animate-pop-in' : ''}`} />
      </button>
      <button
        onClick={() => onAddToProject(result.title)}
        disabled={isAddedToProject}
        aria-label={t('Quick Add to Compilation')}
        className={`flex-shrink-0 p-2 rounded-full transition-colors ${
          isAddedToProject ? 'text-green-500' : 'text-gray-400 hover:bg-accent-100 dark:hover:bg-accent-900/50 hover:text-accent-600'
        } disabled:text-green-500 disabled:cursor-default disabled:hover:bg-transparent dark:disabled:hover:bg-transparent`}
      >
        <Icon name={isAddedToProject ? 'check' : 'plus'} className={`w-5 h-5 ${isAddedToProject ? 'animate-pop-in' : ''}`} />
      </button>
    </li>
  );
});

interface LibraryViewProps {
  getArticleContent: (title: string) => Promise<string>;
}

const LibraryView: React.FC<LibraryViewProps> = ({ getArticleContent }) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { activeProject, addArticleToProject } = useProjects();
  const { addArticle: addArticleToImporter, isArticleStaged } = useImporter();
  const { addToast } = useToasts();

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [sortOption, setSortOption] = useState('relevance');
  
  const { insights, isAnalyzing, analysisError, analyze, clearAnalysis } = useArticleAnalysis(selectedArticle);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const articlesInProject = useMemo(() => 
    new Set(activeProject?.articles.map(a => a.title)),
  [activeProject]);

  useEffect(() => {
    const search = async () => {
      if (debouncedSearchTerm && settings) {
        setIsSearching(true);
        setSearchError(null);
        try {
            const isTitleSort = sortOption === 'az' || sortOption === 'za';
            const apiSort = isTitleSort ? 'relevance' : sortOption;
    
            let searchResults = await searchArticles(debouncedSearchTerm, settings.library.searchResultLimit, apiSort);
            
            if (isTitleSort) {
              searchResults.sort((a, b) => {
                  if (sortOption === 'az') {
                      return a.title.localeCompare(b.title);
                  } else {
                      return b.title.localeCompare(a.title);
                  }
              });
            }
            
            setResults(searchResults);
        } catch (error) {
            console.error("Failed to search articles:", error);
            setSearchError(t('Search failed. Please check your connection.'));
            setResults([]);
        } finally {
            setIsSearching(false);
        }
      } else {
        setResults([]);
        setSearchError(null);
      }
    };
    search();
  }, [debouncedSearchTerm, settings, sortOption, t]);

  const handleSelectArticle = useCallback(async (title: string) => {
    setIsLoadingArticle(true);
    setSelectedArticle(null);
    clearAnalysis();
    try {
        const html = await getArticleContent(title);
        setSelectedArticle({ title, html });
    } catch (error) {
        console.error("Failed to load article:", error);
    }
    setIsLoadingArticle(false);
  }, [getArticleContent, clearAnalysis]);

  const handleAddToImporter = (title: string, html: string) => {
    addArticleToImporter({ title, html });
    addToast(t('Article added to Importer.'), 'success');
  };
  
  if (!settings) return <Spinner />;

  const aiEnabled = settings.library.aiAssistant.enabled && isAiConfigured;
  const isSelectedArticleInProject = selectedArticle ? articlesInProject.has(selectedArticle.title) : false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Search and Results Column */}
      <div className="md:col-span-4 lg:col-span-3 overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-4">
        <div className="relative mb-2">
          <input
            type="text"
            placeholder={t('Search Wikipedia...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="mb-4 text-sm">
            <label htmlFor="sort-library" className="font-medium text-gray-700 dark:text-gray-400 mr-2">{t('Sort by')}:</label>
            <select
                id="sort-library"
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-1 focus:ring-accent-500 outline-none"
            >
                <option value="relevance">{t('Relevance')}</option>
                <option value="last_edit_desc">{t('Date (Newest)')}</option>
                <option value="last_edit_asc">{t('Date (Oldest)')}</option>
                <option value="az">{t('Title (A-Z)')}</option>
                <option value="za">{t('Title (Z-A)')}</option>
            </select>
        </div>
        {isSearching && <Spinner />}
        {searchError && <p className="text-red-500 text-sm text-center my-4">{searchError}</p>}
        {!isSearching && debouncedSearchTerm && results.length === 0 && !searchError && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>{t('No results found for \"{{term}}\"', { term: debouncedSearchTerm })}</p>
          </div>
        )}
        <ul className="space-y-2">
          {results.map((result, index) => (
              <SearchResultItem
                key={result.pageid}
                result={result}
                isSelected={selectedArticle?.title === result.title}
                isAddedToProject={articlesInProject.has(result.title)}
                isAddedToImporter={isArticleStaged(result.title)}
                onSelect={handleSelectArticle}
                onAddToImporter={handleAddToImporter}
                onAddToProject={addArticleToProject}
                getArticle={getArticleContent}
                style={{ animationDelay: `${index * 50}ms` }}
              />
            )
          )}
        </ul>
      </div>

      {/* Article View Column */}
      <div className="md:col-span-8 lg:col-span-9 overflow-y-auto">
        {isLoadingArticle && <SkeletonLoader />}
        {!isLoadingArticle && selectedArticle && (
          <div>
            <div className="flex justify-between items-start gap-4 mb-4 border-b pb-2 dark:border-gray-600">
                <h2 className="text-3xl font-bold flex-grow">{selectedArticle.title}</h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="relative" title={!isAiConfigured ? t('Invalid or missing API Key for Gemini. Please check your configuration.') : undefined}>
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
    </div>
  );
};

export default memo(LibraryView);
```

---

## `components/ArchiveView.tsx`

```typescript
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
```

---

## `components/CompilerView.tsx`

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { useProjects } from '../hooks/useProjectsContext';
import { useSettings } from '../hooks/useSettingsContext';
import { useToasts } from '../hooks/useToasts';
import { generateMarkdown, generateJsonFile, generateDocx, generateOdt } from '../services/exportService';
import Spinner from './Spinner';
import CompilerLeftPanel from './CompilerLeftPanel';
import CompilerRightPanel from './CompilerRightPanel';
// FIX: Imported RightPaneView from types.ts.
import { Project, RightPaneView } from '../types';

interface CompilerViewProps {
  getArticleContent: (title: string) => Promise<string>;
}

// FIX: Removed local RightPaneView type definition, which is now centralized in types.ts.
// export type RightPaneView = 'settings' | 'article' | 'markdown';

const CompilerView: React.FC<CompilerViewProps> = ({ getArticleContent }) => {
  const { activeProject, updateProject } = useProjects();
  const { settings, updateSettings } = useSettings();
  const { addToast } = useToasts();
  
  const [activeArticleTitle, setActiveArticleTitle] = useState<string | null>(null);
  const [rightPaneView, setRightPaneView] = useState<RightPaneView>('settings');

  useEffect(() => {
    if (activeProject) {
        setRightPaneView(activeProject.lastActiveView || 'settings');
    }
  }, [activeProject?.id]);

  useEffect(() => {
    if (activeProject && rightPaneView !== activeProject.lastActiveView) {
        const updatedProject: Project = { ...activeProject, lastActiveView: rightPaneView };
        updateProject(updatedProject);
    }
  }, [rightPaneView, activeProject, updateProject]);

  useEffect(() => {
    // If the active article is no longer in the project, deselect it.
    if (activeProject && activeArticleTitle && !activeProject.articles.some(a => a.title === activeArticleTitle)) {
      setActiveArticleTitle(null);
      setRightPaneView('settings');
    }
  }, [activeProject, activeArticleTitle]);

  const handleSelectArticle = (title: string) => {
    if (activeArticleTitle === title) {
        setActiveArticleTitle(null);
        setRightPaneView('settings');
    } else {
        setActiveArticleTitle(title);
        setRightPaneView('article');
    }
  };

  const handleGenerateMarkdown = useCallback(async () => {
    if (!activeProject) return;
    try {
      await generateMarkdown(activeProject, getArticleContent);
    } catch (error) {
      console.error("Markdown generation failed:", error);
      addToast('Markdown generation failed.', 'error');
    }
  }, [activeProject, getArticleContent, addToast]);
  
  const handleGenerateJson = useCallback(async () => {
    if (!activeProject) return;
    try {
        await generateJsonFile(activeProject, getArticleContent);
    } catch (error) {
        console.error("JSON export failed:", error);
        addToast('JSON export failed.', 'error');
    }
  }, [activeProject, getArticleContent, addToast]);

  const handleGenerateDocx = useCallback(async () => {
    if (!activeProject) return;
    try {
        await generateDocx(activeProject, getArticleContent);
    } catch (error) {
        console.error("DOCX export failed:", error);
        addToast('DOCX export failed.', 'error');
    }
  }, [activeProject, getArticleContent, addToast]);

  const handleGenerateOdt = useCallback(async () => {
    if (!activeProject) return;
    try {
        await generateOdt(activeProject, getArticleContent);
    } catch (error) {
        console.error("ODT export failed:", error);
        addToast('ODT export failed.', 'error');
    }
  }, [activeProject, getArticleContent, addToast]);


  if (!activeProject || !settings) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      <CompilerLeftPanel
        project={activeProject}
        updateProject={updateProject}
        activeArticleTitle={activeArticleTitle}
        onSelectArticle={handleSelectArticle}
      />
      <CompilerRightPanel
        key={activeProject.id} // Re-mount when project changes
        project={activeProject}
        updateProject={updateProject}
        activeArticleTitle={activeArticleTitle}
        getArticleContent={getArticleContent}
        settings={settings}
        updateSettings={updateSettings}
        view={rightPaneView}
        setView={setRightPaneView}
        onGenerateMarkdown={handleGenerateMarkdown}
        onGenerateJson={handleGenerateJson}
        onGenerateDocx={handleGenerateDocx}
        onGenerateOdt={handleGenerateOdt}
      />
    </div>
  );
};

export default CompilerView;
```

---

## `components/ImporterView.tsx`

```typescript
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImporter } from '../hooks/useImporterContext';
import { useProjects } from '../hooks/useProjectsContext';
import { useImageImporter } from '../hooks/useImageImporterContext';
import Icon from './Icon';
import { ArticleContent, ImportedImage } from '../types';
import { useToasts } from '../hooks/useToasts';
import Modal from './Modal';

const ImporterView: React.FC<{ getArticleContent: (title: string) => Promise<string> }> = () => {
    const { t } = useTranslation();
    const { stagedArticles, removeArticle, clearImporter } = useImporter();
    const { addArticleToProject } = useProjects();
    const { addImagesToStaging } = useImageImporter();
    const { addToast } = useToasts();
    
    const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);

    const handleAddToProject = (title: string) => {
        const articleToAdd = stagedArticles.find(a => a.title === title);
        if (!articleToAdd) return;

        // --- New Image Extraction Logic ---
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = articleToAdd.html;
        
        const figures = Array.from(tempDiv.querySelectorAll('figure, .infobox'));
        const imagesInFigures = new Set<HTMLImageElement>();
        const extractedImages: Omit<ImportedImage, 'id' | 'tags' | 'category' | 'notes'>[] = [];

        const isMeaningfulImage = (img: HTMLImageElement, src: string | null): boolean => {
            if (!src) return false;
            // A simple heuristic to filter out small icons and decorative images
            const isTooSmall = (img.width > 0 && img.width < 50) || (img.height > 0 && img.height < 50);
            const isIcon = src.includes('icon') || src.includes('wiki-letter') || src.includes('Wiktionary-logo') || src.endsWith('.svg');
            return !isTooSmall && !isIcon;
        };
        
        figures.forEach(figure => {
            const img = figure.querySelector('img');
            const figcaption = figure.querySelector('figcaption');
            if (img) {
                let src = img.getAttribute('src');
                if (src && isMeaningfulImage(img, src)) {
                    if (src.startsWith('//')) src = 'https:' + src;
                    
                    extractedImages.push({
                        srcUrl: src,
                        altText: img.getAttribute('alt') || '',
                        caption: figcaption ? figcaption.innerText.trim() : (img.getAttribute('alt') || ''),
                        originalArticleTitle: articleToAdd.title,
                    });
                    imagesInFigures.add(img);
                }
            }
        });
        
        if (extractedImages.length > 0) {
            addImagesToStaging(extractedImages);
        }
        // --- End of New Logic ---

        addArticleToProject(title);
        removeArticle(title);
        addToast(t('Article "{{title}}" added to compilation.', { title }), 'success');
    };
    
    const handleAddAllToProject = () => {
        stagedArticles.forEach(article => {
            handleAddToProject(article.title);
        });
        // Clear importer is implicitly called inside handleAddToProject, so this is safe.
        addToast(t('All articles added to compilation.'), 'success');
    };

    return (
        <>
            <Modal isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} title={selectedArticle?.title || ''} actions={
                <button onClick={() => setSelectedArticle(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                    {t('Close')}
                </button>
            }>
                {selectedArticle && <div className="prose dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />}
            </Modal>

            <div className="max-w-7xl mx-auto">
                 <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">{t('Article Importer')}</h1>
                    {stagedArticles.length > 0 && (
                        <div className="flex gap-2">
                            <button onClick={handleAddAllToProject} className="flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm font-semibold">
                                <Icon name="plus" className="w-4 h-4" /> {t('Add All to Compilation')}
                            </button>
                             <button onClick={clearImporter} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold">
                                <Icon name="trash" className="w-4 h-4" /> {t('Clear All')}
                            </button>
                        </div>
                    )}
                </div>

                {stagedArticles.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-16">
                        <Icon name="upload" className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg">{t('No articles staged for import.')}</p>
                        <p>{t('Add articles from the Library view to get started.')}</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {stagedArticles.map(article => (
                            <li key={article.title} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg">{article.title}</h3>
                                    {article.metadata?.touched && <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(article.metadata.touched).toLocaleDateString()}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedArticle(article)} title={t('Preview article') as string} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Icon name="search" className="w-5 h-5" /></button>
                                    <button onClick={() => removeArticle(article.title)} title={t('Remove from importer') as string} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600"><Icon name="trash" className="w-5 h-5" /></button>
                                    <button onClick={() => handleAddToProject(article.title)} className="flex items-center gap-2 bg-accent-600 text-white px-4 py-1.5 rounded-lg hover:bg-accent-700 text-sm">
                                        <Icon name="plus" className="w-4 h-4" /> {t('Add to Project')}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};

export default ImporterView;
```

---

## `components/ImageImporterView.tsx`

```typescript
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageImporter } from '../hooks/useImageImporterContext';
import { ImportedImage } from '../types';
import Icon from './Icon';
import Modal from './Modal';
import Spinner from './Spinner';

interface EditImageModalProps {
    image: ImportedImage | null;
    onClose: () => void;
    onSave: (image: ImportedImage) => void;
}

const EditImageModal: React.FC<EditImageModalProps> = ({ image, onClose, onSave }) => {
    const { t } = useTranslation();
    const [editedImage, setEditedImage] = useState<ImportedImage | null>(image);

    if (!image || !editedImage) return null;

    const handleSave = () => {
        onSave(editedImage);
        onClose();
    };
    
    const handleChange = (field: keyof ImportedImage, value: string | string[]) => {
        setEditedImage(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <Modal isOpen={!!image} onClose={onClose} title={t('Edit Image')} actions={
            <>
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">{t('Cancel')}</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700">{t('Save')}</button>
            </>
        }>
            <div className="space-y-4">
                <img src={editedImage.srcUrl} alt={editedImage.altText} className="max-h-60 w-auto mx-auto rounded-lg object-contain" />
                <div>
                    <label className="text-sm font-medium">{t('Image URL')}</label>
                    <input type="text" value={editedImage.srcUrl} readOnly className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700" />
                </div>
                <div>
                    <label className="text-sm font-medium">{t('Caption')}</label>
                    <textarea value={editedImage.caption} onChange={e => handleChange('caption', e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
                </div>
            </div>
        </Modal>
    );
};


const ImageImporterView: React.FC = () => {
    const { t } = useTranslation();
    const { stagedImages, importedImages, discardStagedImages, importImages, updateImportedImage, deleteImportedImage } = useImageImporter();
    const [activeTab, setActiveTab] = useState<'staging' | 'imported'>('staging');
    const [selectedStaged, setSelectedStaged] = useState<Set<string>>(new Set());
    const [imageToEdit, setImageToEdit] = useState<ImportedImage | null>(null);

    const handleToggleSelectStaged = (id: string) => {
        setSelectedStaged(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };
    
    const handleSelectAllStaged = () => {
        if (selectedStaged.size === stagedImages.length) {
            setSelectedStaged(new Set());
        } else {
            setSelectedStaged(new Set(stagedImages.map(img => img.id)));
        }
    };
    
    const handleImportSelected = () => {
        const toImport = stagedImages.filter(img => selectedStaged.has(img.id));
        importImages(toImport);
        setSelectedStaged(new Set());
    };
    
    const handleDiscardSelected = () => {
        discardStagedImages(Array.from(selectedStaged));
        setSelectedStaged(new Set());
    };
    
    const handleSaveEdit = (image: ImportedImage) => {
        if (activeTab === 'staging') {
            // updateStagedImage is not implemented in the context, but this is a placeholder for future implementation.
            // For now, this will only work for imported images.
        } else {
            updateImportedImage(image);
        }
    };

    const isAllStagedSelected = useMemo(() => stagedImages.length > 0 && selectedStaged.size === stagedImages.length, [stagedImages, selectedStaged]);

    const renderStagingArea = () => (
        <div>
            {stagedImages.length > 0 ? (
                <>
                <div className="flex items-center gap-4 mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <button onClick={handleSelectAllStaged} className="text-sm font-medium">{isAllStagedSelected ? "Deselect All" : t('Select All')}</button>
                    <button onClick={handleImportSelected} disabled={selectedStaged.size === 0} className="flex items-center gap-2 bg-accent-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:bg-gray-400"><Icon name="check" className="w-4 h-4"/>{t('Import Selected')}</button>
                    <button onClick={handleDiscardSelected} disabled={selectedStaged.size === 0} className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:bg-gray-400"><Icon name="trash" className="w-4 h-4"/>{t('Discard Selected')}</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {stagedImages.map(img => (
                        <div key={img.id} className={`relative group border-2 rounded-lg overflow-hidden ${selectedStaged.has(img.id) ? 'border-accent-500' : 'border-transparent'}`} onClick={() => handleToggleSelectStaged(img.id)}>
                            <img src={img.srcUrl} alt={img.altText} className="w-full h-32 object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                                <p className="text-xs line-clamp-2">{img.caption || img.altText}</p>
                                <p className="text-xs text-gray-300 truncate">From: {img.originalArticleTitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
                </>
            ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                    <Icon name="palette" className="w-12 h-12 mx-auto mb-2" />
                    <p>{t('No images staged for import.')}</p>
                    <p className="text-sm">{t('Images extracted from articles will appear here.')}</p>
                </div>
            )}
        </div>
    );
    
    const renderImportedLibrary = () => (
         <div>
            {importedImages.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {importedImages.map(img => (
                        <div key={img.id} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <img src={img.srcUrl} alt={img.altText} className="w-full h-32 object-cover" />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between items-start p-2 text-white">
                                <p className="text-xs line-clamp-3">{img.caption || img.altText}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setImageToEdit(img)} className="bg-white/20 p-1 rounded-full"><Icon name="pencil" className="w-4 h-4"/></button>
                                    <button onClick={() => window.confirm(t('Are you sure you want to delete this image?')) && deleteImportedImage(img.id)} className="bg-white/20 p-1 rounded-full"><Icon name="trash" className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                    <Icon name="palette" className="w-12 h-12 mx-auto mb-2" />
                    <p>{t('No images imported yet.')}</p>
                    <p className="text-sm">{t('Import images from the staging area to build your library.')}</p>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('Image Library')}</h1>
            
            <div className="flex border-b dark:border-gray-700 mb-6">
                <button onClick={() => setActiveTab('staging')} className={`px-4 py-2 text-sm font-medium relative ${activeTab === 'staging' ? 'text-accent-600 dark:text-accent-400' : ''}`}>
                    {t('Staging Area')} {stagedImages.length > 0 && <span className="ml-2 bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stagedImages.length}</span>}
                    {activeTab === 'staging' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"/>}
                </button>
                <button onClick={() => setActiveTab('imported')} className={`px-4 py-2 text-sm font-medium relative ${activeTab === 'imported' ? 'text-accent-600 dark:text-accent-400' : ''}`}>
                    {t('Imported')}
                     {activeTab === 'imported' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"/>}
                </button>
            </div>
            
            {activeTab === 'staging' ? renderStagingArea() : renderImportedLibrary()}
            
            <EditImageModal image={imageToEdit} onClose={() => setImageToEdit(null)} onSave={handleSaveEdit} />
        </div>
    );
};

export default ImageImporterView;
```

---

## `components/SettingsView.tsx`

```typescript
import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import GeneralSettings from './settings/GeneralSettings';
import LibrarySettings from './settings/LibrarySettings';
import CitationSettings from './settings/CitationSettings';
import StorageSettings from './settings/StorageSettings';
import AboutSettings from './settings/AboutSettings';

interface SettingsViewProps {
  reloadApp: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ reloadApp }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('general');

  const sections = {
    general: { label: 'General', icon: 'settings', component: <GeneralSettings /> },
    library: { label: 'Library', icon: 'book', component: <LibrarySettings /> },
    citations: { label: 'Citations', icon: 'key', component: <CitationSettings /> },
    storage: { label: 'Storage', icon: 'archive-box', component: <StorageSettings reloadApp={reloadApp} /> },
    about: { label: 'About', icon: 'info', component: <AboutSettings /> },
  };

  return (
    <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('Settings')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <nav className="space-y-1">
                    {Object.entries(sections).map(([key, {label, icon}]) => (
                        <button 
                            key={key} 
                            onClick={() => setActiveSection(key)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === key ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                        >
                            <Icon name={icon} className="w-5 h-5"/>
                            <span>{t(label)}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="md:col-span-3">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
                    {sections[activeSection as keyof typeof sections].component}
                </div>
            </main>
        </div>
    </div>
  );
};

export default memo(SettingsView);
```

---

## `components/HelpView.tsx`

```typescript
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

const HelpView: React.FC = () => {
  const { t } = useTranslation();

  const helpSections = [
    {
      title: 'help_library_title',
      icon: 'book',
      content: 'help_library_content',
    },
    {
      title: 'help_compiler_title',
      icon: 'compiler',
      content: 'help_compiler_content',
    },
    {
      title: 'help_archive_title',
      icon: 'archive-box',
      content: 'help_archive_content',
    },
    {
      title: 'help_importers_title',
      icon: 'upload',
      content: 'help_importers_content',
    },
    {
      title: 'help_command_palette_title',
      icon: 'command',
      content: 'help_command_palette_content',
    },
    {
      title: 'help_settings_title',
      icon: 'settings',
      content: 'help_settings_content',
    },
    {
      title: 'help_power_tips_title',
      icon: 'sparkles',
      content: 'help_power_tips_content',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center">{t('Help & Getting Started')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {helpSections.map((section) => (
          <div key={section.title} className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-start transform hover:-translate-y-1 transition-transform duration-300">
             <div className="p-3 rounded-full bg-accent-100 dark:bg-accent-900/50 mb-4">
                <Icon name={section.icon} className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              {t(section.title)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm whitespace-pre-line">
              {t(section.content)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(HelpView);
```