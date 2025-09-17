import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImporter } from '../hooks/useImporterContext';
import { useProjects } from '../hooks/useProjectsContext';
import { useImageImporter } from '../hooks/useImageImporterContext';
import Icon from './Icon';
import { ArticleContent, ImportedImage } from '../types';
import { useToasts } from '../hooks/useToasts';
import Modal from './Modal';

const ImporterView: React.FC<{ getArticleContent: (title: string) => Promise<string> }> = () => {
    const { t } = useTranslation();
    const { stagedArticles, removeArticle, clearImporter } = useImporter();
    const { addArticleToProject } = useProjects();
    const { addImagesToStaging } = useImageImporter();
    const { addToast } = useToasts();
    
    const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);

    const handleAddToProject = (title: string) => {
        const articleToAdd = stagedArticles.find(a => a.title === title);
        if (!articleToAdd) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = articleToAdd.html;
        
        const allImages = Array.from(tempDiv.querySelectorAll('img'));
        const extractedImages: Omit<ImportedImage, 'id' | 'tags' | 'category' | 'notes'>[] = [];
        const seenUrls = new Set<string>();

        const isMeaningfulImage = (img: HTMLImageElement, src: string | null): boolean => {
            if (!src) return false;
            const isTooSmall = (img.width > 0 && img.width < 50) || (img.height > 0 && img.height < 50);
            const isIcon = src.includes('icon') || src.includes('wiki-letter') || src.includes('Wiktionary-logo') || src.endsWith('.svg');
            return !isTooSmall && !isIcon;
        };
        
        allImages.forEach(img => {
            let src = img.getAttribute('src');
            if (src && isMeaningfulImage(img, src)) {
                if (src.startsWith('//')) src = 'https:' + src;
                if (seenUrls.has(src)) return; // Avoid duplicates

                const figureParent = img.closest('figure');
                const figcaption = figureParent?.querySelector('figcaption');
                
                extractedImages.push({
                    srcUrl: src,
                    altText: img.getAttribute('alt') || '',
                    caption: figcaption ? figcaption.innerText.trim() : (img.getAttribute('alt') || ''),
                    originalArticleTitle: articleToAdd.title,
                });
                seenUrls.add(src);
            }
        });
        
        if (extractedImages.length > 0) {
            addImagesToStaging(extractedImages);
        }

        addArticleToProject(title);
        removeArticle(title);
        addToast(t('Article "{{title}}" added to compilation.', { title }), 'success');
    };
    
    const handleAddAllToProject = () => {
        stagedArticles.forEach(article => {
            handleAddToProject(article.title);
        });
        addToast(t('All articles added to compilation.'), 'success');
    };

    return (
        <>
            <Modal isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} title={selectedArticle?.title || ''} actions={
                <button onClick={() => setSelectedArticle(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                    {t('Close')}
                </button>
            }>
                {selectedArticle && <div className="prose dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: selectedArticle.html }} />}
            </Modal>

            <div className="max-w-7xl mx-auto">
                 <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">{t('Article Importer')}</h1>
                    {stagedArticles.length > 0 && (
                        <div className="flex gap-2">
                            <button onClick={handleAddAllToProject} className="flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm font-semibold">
                                <Icon name="plus" className="w-4 h-4" /> {t('Add All to Compilation')}
                            </button>
                             <button onClick={clearImporter} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold">
                                <Icon name="trash" className="w-4 h-4" /> {t('Clear All')}
                            </button>
                        </div>
                    )}
                </div>

                {stagedArticles.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-16">
                        <Icon name="upload" className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg">{t('No articles staged for import.')}</p>
                        <p>{t('Add articles from the Library view to get started.')}</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {stagedArticles.map(article => (
                            <li key={article.title} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg">{article.title}</h3>
                                    {article.metadata?.touched && <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(article.metadata.touched).toLocaleDateString()}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedArticle(article)} title={t('Preview article') as string} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><Icon name="search" className="w-5 h-5" /></button>
                                    <button onClick={() => removeArticle(article.title)} title={t('Remove from importer') as string} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600"><Icon name="trash" className="w-5 h-5" /></button>
                                    <button onClick={() => handleAddToProject(article.title)} className="flex items-center gap-2 bg-accent-600 text-white px-4 py-1.5 rounded-lg hover:bg-accent-700 text-sm">
                                        <Icon name="plus" className="w-4 h-4" /> {t('Add to Project')}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};

export default ImporterView;