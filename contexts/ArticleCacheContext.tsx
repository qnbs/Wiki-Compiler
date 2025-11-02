import React, { createContext, useCallback, ReactNode } from 'react';
import { useToasts } from '../hooks/useToasts';
import { getArticleCache, saveArticleCache } from '../services/dbService';
import { getArticleHtml, getArticleMetadata } from '../services/wikipediaService';
import { ArticleContent, ArticleMetadata } from '../types';

interface ArticleCacheContextType {
  getArticleContent: (title: string) => Promise<string>;
}

export const ArticleCacheContext = createContext<ArticleCacheContextType | undefined>(undefined);

export const ArticleCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToasts();

  const getArticleContent = useCallback(async (title: string): Promise<string> => {
      let cachedArticle = await getArticleCache(title);
      if (cachedArticle) {
          return cachedArticle.html;
      }

      try {
          const html = await getArticleHtml(title);
          const metadataArray = await getArticleMetadata([title]);
          const articleToCache: ArticleContent = { 
              title, 
              html, 
              // FIX: Cast the metadata object to the correct type.
              metadata: metadataArray.length > 0 ? metadataArray[0] as ArticleMetadata : undefined 
          };
          await saveArticleCache(articleToCache);
          return html;
      } catch (error) {
          console.error(`Failed to fetch and cache article: ${title}`, error);
          addToast(`Failed to load article: ${title}`, 'error');
          return `<p>Error loading article.</p>`;
      }
  }, [addToast]);

  return (
    <ArticleCacheContext.Provider value={{ getArticleContent }}>
      {children}
    </ArticleCacheContext.Provider>
  );
};