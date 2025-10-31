import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArticleContent } from '../types';
import { getAllArticles, deleteArticleFromCache, clearArticleCache, saveArticleCache } from '../services/dbService';
import { getArticleHtml as fetchArticleHtml, getArticleMetadata } from '../services/wikipediaService';
import { useArticleAnalysis } from '../hooks/useArticleAnalysis';
import { useDebounce } from '../hooks/useDebounce';
import { useProjects } from '../hooks/useProjectsContext';
import { useToasts } from '../hooks/useToasts';

export type ArchiveSortOrder = 'az' | 'za' | 'date_newest' | 'date_oldest';

export interface ArchiveContextType {
    allArticles: ArticleContent[];
    filteredArticles: ArticleContent[];
    selectedArticle: ArticleContent | null;
    searchTerm: string;
    sortOrder: ArchiveSortOrder;
    isLoading: boolean;
    isRefreshing: boolean;
    isDeleteModalOpen: boolean;
    isClearModalOpen: boolean;
    articleToDelete: string | null;
    justAdded: Set<string>;
    articlesInProject: Set<string>;
    
    setSearchTerm: (term: string) => void;
    setSortOrder: (order: ArchiveSortOrder) => void;
    handleSelectArticle: (article: ArticleContent | null) => void;
    setIsDeleteModalOpen: (isOpen: boolean) => void;
    setIsClearModalOpen: (isOpen: boolean) => void;

    handleQuickAdd: (title: string) => void;
    handleDeleteArticle: (title: string) => void;
    confirmDelete: () => Promise<void>;
    confirmClear: () => Promise<void>;
    handleRefreshContent: () => Promise<void>;

    insights: ReturnType<typeof useArticleAnalysis>['insights'];
    isAnalyzing: ReturnType<typeof useArticleAnalysis>['isAnalyzing'];
    analysisError: ReturnType<typeof useArticleAnalysis>['analysisError'];
    analyze: ReturnType<typeof useArticleAnalysis>['analyze'];
}

export const ArchiveContext = createContext<ArchiveContextType | undefined>(undefined);

export const ArchiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { activeProject, addArticleToProject } = useProjects();
    const { addToast } = useToasts();

    const [searchTerm, setSearchTerm] = useState('');
    const [allArticles, setAllArticles] = useState<ArticleContent[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
    const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
    const [sortOrder, setSortOrder] = useState<ArchiveSortOrder>('az');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { insights, isAnalyzing, analysisError, analyze, clearAnalysis } = useArticleAnalysis(selectedArticle);
    const articlesInProject = useMemo(() => new Set(activeProject?.articles.map(a => a.title)), [activeProject]);
    
    const loadArticles = useCallback(async () => {
        setIsLoading(true);
        const articlesFromDb = await getAllArticles();
        setAllArticles(articlesFromDb);
        setIsLoading(false);
    }, []);
    
    useEffect(() => { loadArticles(); }, [loadArticles]);

    const filteredArticles = useMemo(() => {
        const lowercasedFilter = debouncedSearchTerm.toLowerCase();
        let filteredData = allArticles.filter(item => item.title.toLowerCase().includes(lowercasedFilter));
        return filteredData.sort((a, b) => {
            if (sortOrder.startsWith('date')) {
                const dateA = a.metadata?.touched ? new Date(a.metadata.touched).getTime() : 0;
                const dateB = b.metadata?.touched ? new Date(b.metadata.touched).getTime() : 0;
                return sortOrder === 'date_newest' ? dateB - dateA : dateA - dateB;
            }
            return sortOrder === 'az' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        });
    }, [debouncedSearchTerm, allArticles, sortOrder]);

    const handleSelectArticle = useCallback((article: ArticleContent | null) => {
        setSelectedArticle(article);
        clearAnalysis();
    }, [clearAnalysis]);

    const handleQuickAdd = useCallback((title: string) => {
        addArticleToProject(title);
        addToast(t('Article "{{title}}" added to compilation.', { title }), 'success');
        setJustAdded(prev => new Set(prev).add(title));
        setTimeout(() => {
            setJustAdded(prev => { const next = new Set(prev); next.delete(title); return next; });
        }, 2000);
    }, [addArticleToProject, addToast, t]);

    const handleDeleteArticle = useCallback((title: string) => {
        setArticleToDelete(title);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!articleToDelete) return;
        await deleteArticleFromCache(articleToDelete);
        if (selectedArticle?.title === articleToDelete) setSelectedArticle(null);
        await loadArticles();
        setIsDeleteModalOpen(false);
        setArticleToDelete(null);
        addToast(t('Article removed from archive.'), 'success');
    }, [articleToDelete, loadArticles, selectedArticle?.title, addToast, t]);
    
    const confirmClear = useCallback(async () => {
        await clearArticleCache();
        setSelectedArticle(null);
        await loadArticles();
        setIsClearModalOpen(false);
        addToast(t('Cache cleared successfully!'), 'success');
    }, [loadArticles, addToast, t]);

    const handleRefreshContent = useCallback(async () => {
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
            setSelectedArticle(articleToCache);
            setAllArticles(prev => prev.map(a => a.title === articleToCache.title ? articleToCache : a));
            addToast(t('Article "{{title}}" has been updated to the latest version.', { title: selectedArticle.title }), 'success');
        } catch (error) {
            console.error("Failed to refresh article:", error);
            addToast("Failed to refresh article.", "error");
        } finally {
            setIsRefreshing(false);
        }
    }, [selectedArticle, addToast, t]);

    const value: ArchiveContextType = {
        allArticles,
        filteredArticles,
        selectedArticle,
        searchTerm,
        sortOrder,
        isLoading,
        isRefreshing,
        isDeleteModalOpen,
        isClearModalOpen,
        articleToDelete,
        justAdded,
        articlesInProject,
        
        setSearchTerm,
        setSortOrder,
        handleSelectArticle,
        setIsDeleteModalOpen,
        setIsClearModalOpen,
        
        handleQuickAdd,
        handleDeleteArticle,
        confirmDelete,
        confirmClear,
        handleRefreshContent,

        insights,
        isAnalyzing,
        analysisError,
        analyze
    };

    return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
};
