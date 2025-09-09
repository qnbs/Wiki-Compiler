import { useContext } from 'react';
import { ImporterContext } from '../contexts/ImporterContext';

export const useImporter = () => {
  const context = useContext(ImporterContext);
  if (context === undefined) {
    throw new Error('useImporter must be used within an ImporterProvider');
  }
  return context;
};