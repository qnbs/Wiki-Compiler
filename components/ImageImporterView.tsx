import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageImporter } from '../hooks/useImageImporterContext';
import { ImportedImage } from '../types';
import Icon from './Icon';
import Modal from './Modal';
import Spinner from './Spinner';

interface EditImageModalProps {
    image: ImportedImage | null;
    onClose: () => void;
    onSave: (image: ImportedImage) => void;
}

const EditImageModal: React.FC<EditImageModalProps> = ({ image, onClose, onSave }) => {
    const { t } = useTranslation();
    const [editedImage, setEditedImage] = useState<ImportedImage | null>(image);

    if (!image || !editedImage) return null;

    const handleSave = () => {
        onSave(editedImage);
        onClose();
    };
    
    const handleChange = (field: keyof ImportedImage, value: string | string[]) => {
        setEditedImage(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <Modal isOpen={!!image} onClose={onClose} title={t('Edit Image')} actions={
            <>
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">{t('Cancel')}</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700">{t('Save')}</button>
            </>
        }>
            <div className="space-y-4">
                <img src={editedImage.srcUrl} alt={editedImage.altText} className="max-h-60 w-auto mx-auto rounded-lg object-contain" />
                <div>
                    <label className="text-sm font-medium">{t('Image URL')}</label>
                    <input type="text" value={editedImage.srcUrl} readOnly className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700" />
                </div>
                <div>
                    <label className="text-sm font-medium">{t('Caption')}</label>
                    <textarea value={editedImage.caption} onChange={e => handleChange('caption', e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
                </div>
            </div>
        </Modal>
    );
};


const ImageImporterView: React.FC = () => {
    const { t } = useTranslation();
    const { stagedImages, importedImages, discardStagedImages, importImages, updateImportedImage, deleteImportedImage } = useImageImporter();
    const [activeTab, setActiveTab] = useState<'staging' | 'imported'>('staging');
    const [selectedStaged, setSelectedStaged] = useState<Set<string>>(new Set());
    const [imageToEdit, setImageToEdit] = useState<ImportedImage | null>(null);

    const handleToggleSelectStaged = (id: string) => {
        setSelectedStaged(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };
    
    const handleSelectAllStaged = () => {
        if (selectedStaged.size === stagedImages.length) {
            setSelectedStaged(new Set());
        } else {
            setSelectedStaged(new Set(stagedImages.map(img => img.id)));
        }
    };
    
    const handleImportSelected = () => {
        const toImport = stagedImages.filter(img => selectedStaged.has(img.id));
        importImages(toImport);
        setSelectedStaged(new Set());
    };
    
    const handleDiscardSelected = () => {
        discardStagedImages(Array.from(selectedStaged));
        setSelectedStaged(new Set());
    };

     const handleDiscardSingle = (id: string) => {
        discardStagedImages([id]);
        setSelectedStaged(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };
    
    const handleSaveEdit = (image: ImportedImage) => {
        if (activeTab === 'staging') {
            // updateStagedImage is not implemented in the context, but this is a placeholder for future implementation.
            // For now, this will only work for imported images.
        } else {
            updateImportedImage(image);
        }
    };

    const isAllStagedSelected = useMemo(() => stagedImages.length > 0 && selectedStaged.size === stagedImages.length, [stagedImages, selectedStaged]);

    const renderStagingArea = () => (
        <div>
            {stagedImages.length > 0 ? (
                <>
                <div className="flex items-center gap-4 mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                            checked={isAllStagedSelected}
                            onChange={handleSelectAllStaged}
                        />
                        <label className="text-sm font-medium">{t('Select All')}</label>
                    </div>
                    <div className="flex-grow" />
                    <button onClick={handleImportSelected} disabled={selectedStaged.size === 0} className="flex items-center gap-2 bg-accent-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:bg-gray-400"><Icon name="check" className="w-4 h-4"/>{t('Import Selected')}</button>
                    <button onClick={handleDiscardSelected} disabled={selectedStaged.size === 0} className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:bg-gray-400"><Icon name="trash" className="w-4 h-4"/>{t('Discard Selected')}</button>
                </div>
                <ul className="space-y-3">
                    {stagedImages.map(img => (
                        <li key={img.id} className={`flex items-center gap-4 p-3 rounded-lg border ${selectedStaged.has(img.id) ? 'bg-accent-50 dark:bg-accent-900/30 border-accent-200 dark:border-accent-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500 flex-shrink-0"
                                checked={selectedStaged.has(img.id)}
                                onChange={() => handleToggleSelectStaged(img.id)}
                            />
                            <img src={img.srcUrl} alt={img.altText} className="w-24 h-16 object-cover rounded-md bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                            <div className="flex-grow text-sm">
                                <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2">{img.caption || img.altText || t('No caption available')}</p>
                                <p className="text-gray-500 dark:text-gray-400 truncate">{t('From')}: {img.originalArticleTitle}</p>
                            </div>
                            <button onClick={() => handleDiscardSingle(img.id)} className="flex-shrink-0 p-2 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600" title={t('Discard') as string}>
                                <Icon name="trash" className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
                </>
            ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                    <Icon name="palette" className="w-12 h-12 mx-auto mb-2" />
                    <p>{t('No images staged for import.')}</p>
                    <p className="text-sm">{t('Images extracted from articles will appear here.')}</p>
                </div>
            )}
        </div>
    );
    
    const renderImportedLibrary = () => (
         <div>
            {importedImages.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {importedImages.map(img => (
                        <div key={img.id} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <img src={img.srcUrl} alt={img.altText} className="w-full h-32 object-cover" />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between items-start p-2 text-white">
                                <p className="text-xs line-clamp-3">{img.caption || img.altText}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setImageToEdit(img)} className="bg-white/20 p-1 rounded-full"><Icon name="pencil" className="w-4 h-4"/></button>
                                    <button onClick={() => window.confirm(t('Are you sure you want to delete this image?')) && deleteImportedImage(img.id)} className="bg-white/20 p-1 rounded-full"><Icon name="trash" className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                    <Icon name="palette" className="w-12 h-12 mx-auto mb-2" />
                    <p>{t('No images imported yet.')}</p>
                    <p className="text-sm">{t('Import images from the staging area to build your library.')}</p>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('Image Library')}</h1>
            
            <div className="flex border-b dark:border-gray-700 mb-6">
                <button onClick={() => setActiveTab('staging')} className={`px-4 py-2 text-sm font-medium relative ${activeTab === 'staging' ? 'text-accent-600 dark:text-accent-400' : ''}`}>
                    {t('Staging Area')} {stagedImages.length > 0 && <span className="ml-2 bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stagedImages.length}</span>}
                    {activeTab === 'staging' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"/>}
                </button>
                <button onClick={() => setActiveTab('imported')} className={`px-4 py-2 text-sm font-medium relative ${activeTab === 'imported' ? 'text-accent-600 dark:text-accent-400' : ''}`}>
                    {t('Imported')}
                     {activeTab === 'imported' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"/>}
                </button>
            </div>
            
            {activeTab === 'staging' ? renderStagingArea() : renderImportedLibrary()}
            
            <EditImageModal image={imageToEdit} onClose={() => setImageToEdit(null)} onSave={handleSaveEdit} />
        </div>
    );
};

export default ImageImporterView;