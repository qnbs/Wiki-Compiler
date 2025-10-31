import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArticleContent } from '../../types';
import Icon from '../Icon';
import { useArchiveContext } from '../../hooks/useArchiveContext';

interface ArchiveItemProps {
  article: ArticleContent;
  style: React.CSSProperties;
}

const ArchiveItem: React.FC<ArchiveItemProps> = memo(({ article, style }) => {
  const { t } = useTranslation();
  const { 
    articlesInProject,
    justAdded,
    handleSelectArticle,
    handleQuickAdd,
    handleDeleteArticle,
    selectedArticle
  } = useArchiveContext();
  
  const isAdded = articlesInProject.has(article.title);
  const wasJustAdded = justAdded.has(article.title);
  const isSelected = selectedArticle?.title === article.title;

  return (
    <li
      style={style}
      onClick={() => handleSelectArticle(article)} 
      className={`group list-none p-3 rounded-lg transition-colors flex justify-between items-center cursor-pointer shadow-sm border dark:border-gray-700 ${isSelected ? 'bg-accent-100 dark:bg-accent-900/50' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
    >
      <div className="flex-grow truncate pr-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{article.title}</h3>
        {article.metadata?.touched && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(article.metadata.touched).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); handleQuickAdd(article.title); }}
          disabled={isAdded}
          aria-label={t('Quick Add to Compilation')}
          title={t('Quick Add to Compilation') as string}
          className={`p-2 rounded-full transition-colors ${
            isAdded ? 'text-green-500' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-accent-100 dark:hover:bg-accent-900/50 hover:text-accent-600'
          } disabled:opacity-100 disabled:text-green-500 disabled:cursor-not-allowed`}
        >
          <Icon name={isAdded || wasJustAdded ? 'check' : 'plus'} className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.title); }}
          className="p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600"
          aria-label={t('Delete from Archive')}
          title={t('Delete from Archive') as string}
        >
          <Icon name="trash" className="w-5 h-5" />
        </button>
      </div>
    </li>
  );
});

export default ArchiveItem;
