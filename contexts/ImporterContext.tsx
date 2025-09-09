import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ArticleContent } from '../types';
import { getArticleMetadata } from '../services/wikipediaService';

interface ImporterContextType {
  stagedArticles: ArticleContent[];
  addArticle: (article: { title: string, html: string }) => Promise<void>;
  removeArticle: (title: string) => void;
  clearImporter: () => void;
  isArticleStaged: (title: string) => boolean;
}

export const ImporterContext = createContext<ImporterContextType | undefined>(undefined);

export const ImporterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stagedArticles, setStagedArticles] = useState<ArticleContent[]>([]);

  const addArticle = useCallback(async (article: { title: string, html: string }) => {
    // Prevent duplicates
    if (stagedArticles.some(a => a.title === article.title)) {
        return;
    }
    const metadataArray = await getArticleMetadata([article.title]);
    const articleWithMeta: ArticleContent = { 
        ...article,
        metadata: metadataArray.length > 0 ? metadataArray[0] : undefined 
    };

    setStagedArticles(prev => [...prev, articleWithMeta]);
  }, [stagedArticles]);

  const removeArticle = useCallback((title: string) => {
    setStagedArticles(prev => prev.filter(a => a.title !== title));
  }, []);
  
  const clearImporter = useCallback(() => {
    setStagedArticles([]);
  }, []);

  const isArticleStaged = useCallback((title: string) => {
    return stagedArticles.some(a => a.title === title);
  }, [stagedArticles]);

  const value = {
    stagedArticles,
    addArticle,
    removeArticle,
    clearImporter,
    isArticleStaged
  };

  return (
    <ImporterContext.Provider value={value}>
      {children}
    </ImporterContext.Provider>
  );
};