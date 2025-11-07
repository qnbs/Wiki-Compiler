import React from 'react';
import { useLibraryContext } from '../../hooks/useLibraryContext';
import Icon from '../Icon';
import Spinner from '../Spinner';
import SearchResultItem from './SearchResultItem';
import { VirtualList } from '../VirtualList';

const LibrarySearchPanel: React.FC = () => {
    const {
        t,
        searchTerm,
        setSearchTerm,
        sortOption,
        setSortOption,
        isSearching,
        searchError,
        results,
        debouncedSearchTerm
    } = useLibraryContext();

    return (
        <div className="md:col-span-4 lg:col-span-3 overflow-hidden border-r border-gray-200 dark:border-gray-700 pr-4 flex flex-col h-full">
            <div className="flex-shrink-0">
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
                        <option value="title_asc">{t('Title (A-Z)')}</option>
                        <option value="title_desc">{t('Title (Z-A)')}</option>
                    </select>
                </div>
            </div>
            
            <div className="flex-grow mt-2 relative">
                {isSearching && <div className="absolute inset-0 flex justify-center pt-10 bg-gray-50/50 dark:bg-gray-950/50 z-10"><Spinner /></div>}
                
                {searchError && <p className="text-red-500 text-sm text-center my-4">{searchError}</p>}
                
                {!isSearching && debouncedSearchTerm && results.length === 0 && !searchError && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                        <p>{t('No results found for "{{term}}"', { term: debouncedSearchTerm })}</p>
                    </div>
                )}

                {results.length > 0 && (
                    <VirtualList
                        items={results}
                        itemHeight={96} // h-24
                        getKey={(item) => item.pageid}
                        renderItem={(result, style) => (
                           <SearchResultItem
                                result={result}
                                style={{ ...style, padding: '4px 0' }}
                            />
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default LibrarySearchPanel;
