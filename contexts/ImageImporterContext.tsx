import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ImportedImage } from '../types';
import { getImportedImages, saveImportedImage, deleteImportedImage as dbDeleteImportedImage } from '../services/dbService';

interface ImageImporterContextType {
  // Staging area state and functions
  stagedImages: ImportedImage[];
  addImagesToStaging: (images: Omit<ImportedImage, 'id' | 'tags' | 'category' | 'notes'>[]) => Promise<void>;
  updateStagedImage: (image: ImportedImage) => void;
  discardStagedImages: (ids: string[]) => void;
  importImages: (images: ImportedImage[]) => Promise<void>;

  // Imported library state and functions
  importedImages: ImportedImage[];
  updateImportedImage: (image: ImportedImage) => Promise<void>;
  deleteImportedImage: (id: string) => Promise<void>;
  loadImportedImages: () => Promise<void>;
}

export const ImageImporterContext = createContext<ImageImporterContextType | undefined>(undefined);

export const ImageImporterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stagedImages, setStagedImages] = useState<ImportedImage[]>([]);
  const [importedImages, setImportedImages] = useState<ImportedImage[]>([]);

  const loadImportedImages = useCallback(async () => {
    const dbImages = await getImportedImages();
    setImportedImages(dbImages);
  }, []);

  useEffect(() => {
    loadImportedImages();
  }, [loadImportedImages]);

  const addImagesToStaging = useCallback(async (imagesToAdd: Omit<ImportedImage, 'id' | 'tags' | 'category' | 'notes'>[]) => {
    const existingUrls = new Set([...stagedImages.map(i => i.srcUrl), ...importedImages.map(i => i.srcUrl)]);
    
    const newImages = imagesToAdd
      .filter(img => !existingUrls.has(img.srcUrl))
      .map(img => ({
        ...img,
        id: crypto.randomUUID(),
        tags: [],
        category: '',
        notes: '',
      }));

    if (newImages.length > 0) {
        setStagedImages(prev => [...prev, ...newImages]);
    }
  }, [stagedImages, importedImages]);

  const updateStagedImage = useCallback((image: ImportedImage) => {
    setStagedImages(prev => prev.map(img => (img.id === image.id ? image : img)));
  }, []);

  const discardStagedImages = useCallback((ids: string[]) => {
    setStagedImages(prev => prev.filter(img => !ids.includes(img.id)));
  }, []);
  
  const importImages = useCallback(async (imagesToImport: ImportedImage[]) => {
    for (const image of imagesToImport) {
        await saveImportedImage(image);
    }
    const importedIds = new Set(imagesToImport.map(i => i.id));
    setStagedImages(prev => prev.filter(img => !importedIds.has(img.id)));
    // Use functional update to ensure we have the latest state
    setImportedImages(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newImagesToAdd = imagesToImport.filter(i => !existingIds.has(i.id));
        return [...prev, ...newImagesToAdd];
    });
  }, []);

  const updateImportedImage = useCallback(async (image: ImportedImage) => {
    await saveImportedImage(image);
    setImportedImages(prev => prev.map(img => (img.id === image.id ? image : img)));
  }, []);

  const deleteImportedImage = useCallback(async (id: string) => {
    await dbDeleteImportedImage(id);
    setImportedImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const value = {
    stagedImages,
    addImagesToStaging,
    updateStagedImage,
    discardStagedImages,
    importImages,
    importedImages,
    updateImportedImage,
    deleteImportedImage,
    loadImportedImages
  };

  return (
    <ImageImporterContext.Provider value={value}>
      {children}
    </ImageImporterContext.Provider>
  );
};
