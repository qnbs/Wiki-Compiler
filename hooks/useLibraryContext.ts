import { useContext } from 'react';
import { LibraryContext, LibraryContextType } from '../contexts/LibraryContext';

export const useLibraryContext = (): LibraryContextType => {
    const context = useContext(LibraryContext);
    if (context === undefined) {
        throw new Error('useLibraryContext must be used within a LibraryProvider');
    }
    return context;
};
