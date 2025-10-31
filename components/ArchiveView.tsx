import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArchiveProvider } from '../contexts/ArchiveContext';
import { useArchiveContext } from '../hooks/useArchiveContext';
import Modal from './Modal';
import ArchiveListPanel from './archive/ArchiveListPanel';
import ArchiveArticlePanel from './archive/ArchiveArticlePanel';

const ArchiveViewContent: React.FC = () => {
    const { t } = useTranslation();
    const {
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        articleToDelete,
        confirmDelete,
        isClearModalOpen,
        setIsClearModalOpen,
        confirmClear
    } = useArchiveContext();

    return (
        <>
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('Delete from Archive')} actions={
                <>
                    <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">{t('Cancel')}</button>
                    <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">{t('Delete')}</button>
                </>
            }>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('Remove Article from Archive Confirmation', { articleTitle: articleToDelete })}</p>
            </Modal>
            
            <Modal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} title={t('Clear Archive')} actions={
                <>
                    <button onClick={() => setIsClearModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">{t('Cancel')}</button>
                    <button onClick={confirmClear} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">{t('Delete All')}</button>
                </>
            }>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('Are you sure you want to delete all articles from your archive? This action cannot be undone.')}</p>
            </Modal>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
                <ArchiveListPanel />
                <ArchiveArticlePanel />
            </div>
        </>
    );
};

const ArchiveView: React.FC = () => {
    return (
        <ArchiveProvider>
            <ArchiveViewContent />
        </ArchiveProvider>
    );
};

export default memo(ArchiveView);
