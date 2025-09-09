import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ImportedImage } from '../types';
import { getImportedImages, saveImportedImage, deleteImportedImage as dbDelete } from '../services/dbService';

interface ImageImporterContextType {
  images: ImportedImage[];
  addImage: (image: Omit<ImportedImage, 'id' | 'tags' | 'category' | 'notes'>) => Promise<void>;
  updateImage: (updatedImage: ImportedImage) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  clearImporter: () => Promise<void>;
}

export const ImageImporterContext = createContext<ImageImporterContextType | undefined>(undefined);

export const ImageImporterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<ImportedImage[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      const dbImages = await getImportedImages();
      setImages(dbImages);
    };
    loadImages();
  }, []);

  const addImage = useCallback(async (imageData: Omit<ImportedImage, 'id' | 'tags' | 'category' | 'notes'>) => {
    const newImage: ImportedImage = {
        id: crypto.randomUUID(),
        ...imageData,
        tags: [],
        category: '',
        notes: '',
    };
    
    setImages(prev => [...prev, newImage]);
    await saveImportedImage(newImage);
  }, []);
  
  const updateImage = useCallback(async (updatedImage: ImportedImage) => {
    setImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
    await saveImportedImage(updatedImage);
  }, []);

  const deleteImage = useCallback(async (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    await dbDelete(id);
  }, []);
  
  const clearImporter = useCallback(async () => {
    const deletePromises = images.map(img => dbDelete(img.id));
    await Promise.all(deletePromises);
    setImages([]);
  }, [images]);


  const value = {
    images,
    addImage,
    updateImage,
    deleteImage,
    clearImporter
  };

  return (
    <ImageImporterContext.Provider value={value}>
      {children}
    </ImageImporterContext.Provider>
  );
};