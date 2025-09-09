import { useContext } from 'react';
import { ImageImporterContext } from '../contexts/ImageImporterContext';

export const useImageImporter = () => {
  const context = useContext(ImageImporterContext);
  if (context === undefined) {
    throw new Error('useImageImporter must be used within an ImageImporterProvider');
  }
  return context;
};