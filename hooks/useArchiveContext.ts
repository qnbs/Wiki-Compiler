import { useContext } from 'react';
import { ArchiveContext, ArchiveContextType } from '../contexts/ArchiveContext';

export const useArchiveContext = (): ArchiveContextType => {
    const context = useContext(ArchiveContext);
    if (context === undefined) {
        throw new Error('useArchiveContext must be used within an ArchiveProvider');
    }
    return context;
};
