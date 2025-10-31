import React, { memo } from 'react';
import { SearchResult } from '../../types';
import Icon from '../Icon';
import { useLibraryContext } from '../../hooks/useLibraryContext';

interface SearchResultItemProps {
    result: SearchResult;
    style: React.CSSProperties;
}

const SearchResultItem: React.FC<SearchResultItemProps> = memo(({ result, style }) => {
    const { 
        t, 
        selectedArticle, 
        articlesInProject, 
        isArticleStaged, 
        handleSelectArticle, 
        handleAddToImporter, 
        addArticleToProject,
        getArticleContent
    } = useLibraryContext();

    const isSelected = selectedArticle?.title === result.title;
    const isAddedToProject = articlesInProject.has(result.title);
    const isAddedToImporter = isArticleStaged(result.title);

    const onAddToImporter = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const html = await getArticleContent(result.title);
        handleAddToImporter(result.title, html);
    };

    return (
        <li
            style={style}
            className={`group p-3 rounded-lg transition-colors flex justify-between items-center animate-fade-in list-none ${isSelected ? 'bg-accent-100 dark:bg-accent-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
            <div onClick={() => handleSelectArticle(result.title)} className="cursor-pointer flex-grow truncate pr-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{result.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{result.snippet}</p>
                {result.timestamp && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(result.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                )}
            </div>
            <div className="flex items-center flex-shrink-0">
                <button
                    onClick={onAddToImporter}
                    disabled={isAddedToImporter}
                    title={t('Add to Importer') as string}
                    aria-label={t('Add to Importer')}
                    className={`p-2 rounded-full transition-colors ${
                    isAddedToImporter ? 'text-green-500' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-accent-100 dark:hover:bg-accent-900/50 hover:text-accent-600'
                    } disabled:opacity-100 disabled:text-green-500 disabled:cursor-default`}
                >
                    <Icon name={isAddedToImporter ? 'check' : 'upload'} className={`w-5 h-5 ${isAddedToImporter ? 'animate-pop-in' : ''}`} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); addArticleToProject(result.title); }}
                    disabled={isAddedToProject}
                    title={t('Quick Add to Compilation') as string}
                    aria-label={t('Quick Add to Compilation')}
                    className={`p-2 rounded-full transition-colors ${
                    isAddedToProject ? 'text-green-500' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-accent-100 dark:hover:bg-accent-900/50 hover:text-accent-600'
                    } disabled:opacity-100 disabled:text-green-500 disabled:cursor-default`}
                >
                    <Icon name={isAddedToProject ? 'check' : 'plus'} className={`w-5 h-5 ${isAddedToProject ? 'animate-pop-in' : ''}`} />
                </button>
            </div>
        </li>
    );
});

export default SearchResultItem;
