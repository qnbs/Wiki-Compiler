import React from 'react';
import { useTranslation } from 'react-i18next';
import { useArchiveContext } from '../../hooks/useArchiveContext';
import Icon from '../Icon';
import SkeletonLoader from '../SkeletonLoader';
import ArchiveItem from './ArchiveItem';
import { VirtualList } from '../VirtualList';

const ArchiveListPanel: React.FC = () => {
    const { t } = useTranslation();
    const {
        allArticles,
        filteredArticles,
        searchTerm,
        setSearchTerm,
        sortOrder,
        setSortOrder,
        isLoading,
        setIsClearModalOpen
    } = useArchiveContext();

    return (
        <div className="md:col-span-4 lg:col-span-3 border-r border-gray-200 dark:border-gray-700 pr-4 flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">{t('Article Archive')}</h1>
                    {allArticles.length > 0 && (
                        <button onClick={() => setIsClearModalOpen(true)} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400">
                            <Icon name="trash" className="w-4 h-4" /> {t('Clear Archive')}
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4 mb-4">
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
            </div>

            <div className="flex-grow mt-2 relative">
                {isLoading && <SkeletonLoader />}
                {!isLoading && filteredArticles.length > 0 && (
                    <VirtualList
                        items={filteredArticles}
                        itemHeight={88}
                        getKey={(article) => article.title}
                        renderItem={(article, style) => (
                            <ArchiveItem article={article} style={{...style, padding: '4px 0'}} />
                        )}
                    />
                )}
                {!isLoading && allArticles.length > 0 && filteredArticles.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8"><p>{t('No results found for "{{term}}"', { term: searchTerm })}</p></div>
                )}
                {!isLoading && allArticles.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-16">
                        <Icon name="archive-box" className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-lg">{t('Your archive is empty.')}</p>
                        <p>{t('Viewed articles will appear here.')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArchiveListPanel;
