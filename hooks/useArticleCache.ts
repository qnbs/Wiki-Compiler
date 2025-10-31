import { useContext } from 'react';
import { ArticleCacheContext } from '../contexts/ArticleCacheContext';

export const useArticleCache = () => {
  const context = useContext(ArticleCacheContext);
  if (context === undefined) {
    throw new Error('useArticleCache must be used within an ArticleCacheProvider');
  }
  return context;
};
