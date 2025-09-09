import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageImporter } from '../hooks/useImageImporterContext';
import { useDebounce } from '../hooks/useDebounce';
import { ImportedImage } from '../types';
import Icon from './Icon';

const ImageEditor: React.FC<{ image: ImportedImage, onUpdate: (image: ImportedImage) => void }> = ({ image, onUpdate }) => {
    const { t } = useTranslation();
    const [category, setCategory] = useState(image.category);
    const [notes, setNotes] = useState(image.notes);
    const [tags, setTags] = useState(image.tags);
    const [tagInput, setTagInput] = useState('');
    
    const debouncedCategory = useDebounce(category, 500);
    const debouncedNotes = useDebounce(notes, 500);

    useEffect(() => {
        setCategory(image.category);
        setNotes(image.notes);
        setTags(image.tags);
    }, [image]);

    useEffect(() => {
        if (debouncedCategory !== image.category) {
            onUpdate({ ...image, category: debouncedCategory });
        }
    }, [debouncedCategory, image, onUpdate]);

    useEffect(() => {
        if (debouncedNotes !== image.notes) {
            onUpdate({ ...image, notes: debouncedNotes });
        }
    }, [debouncedNotes, image, onUpdate]);

    const handleAddTag = () => {
        if (tagInput && !tags.includes(tagInput)) {
            const newTags = [...tags, tagInput];
            setTags(newTags);
            onUpdate({ ...image, tags: newTags });
            setTagInput('');
        }
    };
    
    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        onUpdate({ ...image, tags: newTags });
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-xl font-bold">{t('Image Details')}</h3>
            <img src={image.srcUrl} alt={image.altText} className="rounded-lg max-w-full h-auto max-h-64 object-contain mx-auto" />

            <InfoField label={t('Original Article')} value={image.originalArticleTitle} />
            {image.caption && <InfoField label={t('Caption')} value={image.caption} />}
            {image.altText && <InfoField label={t('Alt Text')} value={image.altText} />}
            
            <EditableField label={t('Category')} value={category} onChange={setCategory} placeholder={t('Uncategorized')} />
            <EditableField label={t('Notes')} value={notes} onChange={setNotes} placeholder={t('Add notes...')} isTextarea />

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Tags')}</label>
                <div className="flex flex-wrap gap-2 mt-1">
                    {tags.map(tag => (
                        <div key={tag} className="flex items-center gap-1 bg-accent-100 dark:bg-accent-900/50 px-2 py-1 rounded-full text-sm">
                            <span>{tag}</span>
                            <button onClick={() => handleRemoveTag(tag)} className="text-accent-700 dark:text-accent-300 hover:text-red-500">
                                <Icon name="x-mark" className="w-3 h-3"/>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                    <input 
                        type="text" 
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                        placeholder={t('Add a tag')}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800"
                    />
                    <button onClick={handleAddTag} className="px-3 py-1 text-sm bg-accent-600 text-white rounded-md hover:bg-accent-700">{t('Add')}</button>
                </div>
            </div>
        </div>
    );
};

const InfoField: React.FC<{label: string, value: string}> = ({ label, value }) => (
    <div>
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</h4>
        <p className="text-gray-800 dark:text-gray-200">{value}</p>
    </div>
);

const EditableField: React.FC<{label:string, value:string, onChange: (val:string) => void, placeholder: string, isTextarea?: boolean}> = ({ label, value, onChange, placeholder, isTextarea }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {isTextarea ? (
             <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
        ) : (
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
        )}
    </div>
);


const ImageImporterView: React.FC = () => {
  const { t } = useTranslation();
  const { images, updateImage, deleteImage, clearImporter } = useImageImporter();
  const [selectedImage, setSelectedImage] = useState<ImportedImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredImages = useMemo(() => {
    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    if (!lowercasedFilter) return images;
    return images.filter(img => 
        img.originalArticleTitle.toLowerCase().includes(lowercasedFilter) ||
        img.caption.toLowerCase().includes(lowercasedFilter) ||
        img.altText.toLowerCase().includes(lowercasedFilter) ||
        img.tags.some(tag => tag.toLowerCase().includes(lowercasedFilter))
    );
  }, [debouncedSearchTerm, images]);

  useEffect(() => {
    if (selectedImage && !images.some(img => img.id === selectedImage.id)) {
        setSelectedImage(null);
    }
  }, [images, selectedImage]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Image List Column */}
      <div className="md:col-span-5 lg:col-span-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-4">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">{t('Images to Import')}</h2>
            {images.length > 0 && (
                <button onClick={clearImporter} className="text-sm text-red-500 hover:underline">
                    {t('Clear Image Importer')}
                </button>
            )}
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={t('Search images...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredImages.map(image => (
                    <div 
                        key={image.id}
                        onClick={() => setSelectedImage(image)}
                        className={`relative group aspect-square rounded-lg cursor-pointer overflow-hidden ${selectedImage?.id === image.id ? 'ring-2 ring-accent-500' : ''}`}
                    >
                       <img src={image.srcUrl} alt={image.altText} className="w-full h-full object-cover"/>
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                           <p className="text-white text-xs line-clamp-2">{image.caption || image.altText}</p>
                       </div>
                       <button
                         onClick={(e) => { e.stopPropagation(); deleteImage(image.id); }}
                         className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600"
                       >
                           <Icon name="trash" className="w-4 h-4" />
                       </button>
                    </div>
                ))}
            </div>
        ) : (
             <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8 rounded-lg border-2 border-dashed dark:border-gray-700">
              <Icon name="palette" className="w-12 h-12 mb-2"/>
              <p>{t('Your image importer is empty.')}</p>
              <p className="text-sm">{t('Images from articles added to the Article Importer will appear here.')}</p>
            </div>
        )}
      </div>

      {/* Details Column */}
      <div className="md:col-span-7 lg:col-span-8 overflow-y-auto">
        {selectedImage ? (
            <ImageEditor image={selectedImage} onUpdate={updateImage} />
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <Icon name="palette" className="w-16 h-16 mb-4" />
                <p className="text-lg">{t('Select an image to view details and edit.')}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageImporterView;