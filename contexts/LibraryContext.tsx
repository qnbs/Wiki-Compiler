import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { searchArticles } from '../services/wikipediaService';
import { useSettings } from '../hooks/useSettingsContext';
import { useProjects } from '../hooks/useProjectsContext';
import { useImporter } from '../hooks/useImporterContext';
import { useToasts } from '../hooks/useToasts';
import { useDebounce } from '../hooks/useDebounce';
import { useArticleAnalysis } from '../hooks/useArticleAnalysis';
import { useArticleCache } from '../hooks/useArticleCache';
import { ArticleContent, SearchResult, AppSettings, ArticleInsights } from '../types';

export interface LibraryContextType {
    t: (key: string, options?: any) => string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOption: string;
    setSortOption: (option: string) => void;
    isSearching: boolean;
    searchError: string | null;
    results: SearchResult[];
    debouncedSearchTerm: string;
    isLoadingArticle: boolean;
    selectedArticle: ArticleContent | null;
    analyze: () => void;
    isAnalyzing: boolean;
    addArticleToProject: (title: string) => void;
    articlesInProject: Set<string>;
    settings: AppSettings | null;
    insights: ArticleInsights | null;
    analysisError: string | null;
    handleSelectArticle: (title: string) => void;
    handleAddToImporter: (title: string, html: string) => void;
    isArticleStaged: (title: string) => boolean;
    getArticleContent: (title: string) => Promise<string>;
}

export const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

interface LibraryProviderProps {
    children: ReactNode;
}

export const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const { activeProject, addArticleToProject: addArticleToProjectCtx } = useProjects();
    const { addArticle: addArticleToImporter, isArticleStaged } = useImporter();
    const { addToast } = useToasts();
    const { getArticleContent } = useArticleCache();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('relevance');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
    const [isLoadingArticle, setIsLoadingArticle] = useState(false);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { insights, isAnalyzing, analysisError, analyze, clearAnalysis } = useArticleAnalysis(selectedArticle);

    const articlesInProject = useMemo(() => new Set(activeProject?.articles.map(a => a.title)), [activeProject]);

    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedSearchTerm) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            setSearchError(null);
            try {
                const limit = settings?.library.searchResultLimit || 10;
                const searchResults = await searchArticles(debouncedSearchTerm, limit, sortOption);
                setResults(searchResults);
            } catch (error) {
                console.error("Search failed:", error);
                setSearchError(t('Search failed. Please check your connection.'));
            } finally {
                setIsSearching(false);
            }
        };
        performSearch();
    }, [debouncedSearchTerm, sortOption, settings?.library.searchResultLimit, t]);
    
    const handleSelectArticle = useCallback(async (title: string) => {
        setIsLoadingArticle(true);
        setSelectedArticle(null);
        clearAnalysis();
        try {
            const html = await getArticleContent(title);
            setSelectedArticle({ title, html });
        } catch (error) {
            console.error(error);
            addToast(`Error loading article: ${title}`, 'error');
        } finally {
            setIsLoadingArticle(false);
        }
    }, [getArticleContent, clearAnalysis, addToast]);

    const addArticleToProject = (title: string) => {
        addArticleToProjectCtx(title);
        addToast(t('Article "{{title}}" added to compilation.', { title }), 'success');
    };
    
    const handleAddToImporter = (title: string, html: string) => {
        addArticleToImporter({ title, html });
        addToast(t('Article added to Importer.'), 'info');
    };

    const value = {
        t,
        searchTerm,
        setSearchTerm,
        sortOption,
        setSortOption,
        isSearching,
        searchError,
        results,
        debouncedSearchTerm,
        isLoadingArticle,
        selectedArticle,
        analyze,
        isAnalyzing,
        addArticleToProject,
        articlesInProject,
        settings,
        insights,
        analysisError,
        handleSelectArticle,
        handleAddToImporter,
        isArticleStaged,
        getArticleContent
    };

    return (
        <LibraryContext.Provider value={value}>
            {children}
        </LibraryContext.Provider>
    );
};