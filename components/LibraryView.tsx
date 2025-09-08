import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useDebounce';
import { SearchResult, ArticleContent, ArticleInsights, AppSettings, Project } from '../types';
import { searchArticles } from '../services/wikipediaService';
import { getArticleInsights } from '../services/geminiService';
import Icon from './Icon';
import Spinner from './Spinner';
import ArticleInsightsView from './ArticleInsightsView';

interface LibraryViewProps {
  addArticleToProject: (title: string) => void;
  getArticleContent: (title: string) => Promise<string>;
  settings: AppSettings;
  activeProject: Project;
}

const LibraryView: React.FC<LibraryViewProps> = ({ addArticleToProject, getArticleContent, settings, activeProject }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [insights, setInsights] = useState<ArticleInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'az' | 'za'>('az');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const articlesInProject = useMemo(() => 
    new Set(activeProject.articles.map(a => a.title)),
  [activeProject]);

  useEffect(() => {
    const search = async () => {
      if (debouncedSearchTerm) {
        setIsSearching(true);
        let searchResults = await searchArticles(debouncedSearchTerm, settings.library.searchResultLimit);
        
        searchResults.sort((a, b) => {
            if (sortOrder === 'az') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });
        
        setResults(searchResults);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    };
    search();
  }, [debouncedSearchTerm, settings.library.searchResultLimit, sortOrder]);

  const handleSelectArticle = useCallback(async (title: string) => {
    setIsLoadingArticle(true);
    setSelectedArticle(null);
    setInsights(null);
    setAnalysisError(null);
    try {
        const html = await getArticleContent(title);
        setSelectedArticle({ title, html });
    } catch (error) {
        console.error("Failed to load article:", error);
    }
    setIsLoadingArticle(false);
  }, [getArticleContent]);

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

  const handleAnalyze = async () => {
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="mb-4 text-sm">
            <label htmlFor="sort-library" className="font-medium text-gray-700 dark:text-gray-400 mr-2">{t('Sort by')}:</label>
            <select
                id="sort-library"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'az' | 'za')}
                className="py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            >
                <option value="az">{t('Title (A-Z)')}</option>
                <option value="za">{t('Title (Z-A)')}</option>
            </select>
        </div>
        {isSearching && <Spinner />}
        <ul className="space-y-2">
          {results.map((result) => {
            const isAdded = articlesInProject.has(result.title);
            const wasJustAdded = justAdded.has(result.title);
            
            return (
              <li key={result.pageid}
                className={`group p-3 rounded-lg transition-colors flex justify-between items-center ${selectedArticle?.title === result.title ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <div onClick={() => handleSelectArticle(result.title)} className="cursor-pointer flex-grow truncate pr-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{result.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{result.snippet}</p>
                </div>
                <button
                  onClick={() => handleQuickAdd(result.title)}
                  disabled={isAdded}
                  aria-label={t('Quick Add to Compilation')}
                  className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                    isAdded ? 'text-green-500' : 'text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600'
                  } disabled:text-green-500 disabled:cursor-default disabled:hover:bg-transparent dark:disabled:hover:bg-transparent`}
                >
                  <Icon name={isAdded || wasJustAdded ? 'check' : 'plus'} className="w-5 h-5" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Article View Column */}
      <div className="md:col-span-8 lg:col-span-9 overflow-y-auto">
        {isLoadingArticle && <div className="flex justify-center items-center h-full"><Spinner /></div>}
        {!isLoadingArticle && selectedArticle && (
          <div className="relative">
             <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                {settings.library.aiAssistant.enabled && (
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Icon name="beaker" className="w-4 h-4"/>
                        {isAnalyzing ? t('Analyzing...') : t('Analyze with AI')}
                    </button>
                )}
                <button
                    onClick={() => addArticleToProject(selectedArticle.title)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
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

            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />
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

export default LibraryView;