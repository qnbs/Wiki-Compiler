import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'https://esm.sh/react-i18next@14.1.2';
import { ArticleContent } from '../types';
import { getAllArticles, deleteArticleFromCache } from '../services/dbService';
import Icon from './Icon';
import Spinner from './Spinner';
import Modal from './Modal';

interface ArchiveViewProps {
  addArticleToProject: (title: string) => void;
  getArticleContent: (title: string) => Promise<string>;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ addArticleToProject, getArticleContent }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [allArticles, setAllArticles] = useState<ArticleContent[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleContent[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  
  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    const articlesFromDb = await getAllArticles();
    // Sort articles alphabetically by title
    articlesFromDb.sort((a, b) => a.title.localeCompare(b.title));
    setAllArticles(articlesFromDb);
    setFilteredArticles(articlesFromDb);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = allArticles.filter(item =>
      item.title.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredArticles(filteredData);
  }, [searchTerm, allArticles]);

  const handleSelectArticle = useCallback(async (title: string) => {
    // We already have the HTML from the initial load, so we just find it.
    const article = allArticles.find(a => a.title === title);
    if(article) {
        setSelectedArticle(article);
    }
  }, [allArticles]);

  const handleDeleteArticle = (title: string) => {
    setArticleToDelete(title);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    await deleteArticleFromCache(articleToDelete);
    if (selectedArticle?.title === articleToDelete) {
        setSelectedArticle(null);
    }
    await loadArticles();
    setIsDeleteModalOpen(false);
    setArticleToDelete(null);
  };


  return (
    <>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('Delete Article')}
        actions={
          <>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
              {t('Cancel')}
            </button>
            <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
              {t('Delete')}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('Delete Article Confirmation', { articleTitle: articleToDelete })}
        </p>
      </Modal>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        {/* Search and Results Column */}
        <div className="md:col-span-4 lg:col-span-3 overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-4">
          <h2 className="text-2xl font-bold mb-4">{t('Article Archive')}</h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder={t('Search Archive...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          {isLoading && <Spinner />}
          {!isLoading && filteredArticles.length > 0 && (
              <ul className="space-y-2">
              {filteredArticles.map((article) => (
                  <li key={article.title} onClick={() => handleSelectArticle(article.title)}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${selectedArticle?.title === article.title ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">{article.title}</h3>
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.title); }}
                          className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={t('Delete from Archive')}
                      >
                          <Icon name="trash" className="w-4 h-4" />
                      </button>
                  </li>
              ))}
              </ul>
          )}
          {!isLoading && filteredArticles.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <Icon name="archive-box" className="w-12 h-12 mx-auto mb-2" />
                  <p>{t('Your archive is empty.')}</p>
                  <p className="text-sm">{t('Viewed articles will appear here.')}</p>
              </div>
          )}
        </div>

        {/* Article View Column */}
        <div className="md:col-span-8 lg:col-span-9 overflow-y-auto">
          {selectedArticle && (
            <div className="relative">
              <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                  <button
                      onClick={() => addArticleToProject(selectedArticle.title)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                      <Icon name="plus" className="w-4 h-4"/>
                      {t('Add to Compilation')}
                  </button>
              </div>
              <h2 className="text-3xl font-bold mb-4 border-b pb-2 dark:border-gray-600 pr-48">{selectedArticle.title}</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />
            </div>
          )}
          {!selectedArticle && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <Icon name="book" className="w-16 h-16 mb-4" />
              <p className="text-lg">{t('Select an article to read')}</p>
              <p>{t('or select one from the list.')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ArchiveView;
