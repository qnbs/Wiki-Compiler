import React, { memo } from 'react';
import { LibraryProvider } from '../contexts/LibraryContext';
import Spinner from './Spinner';
import LibrarySearchPanel from './library/LibrarySearchPanel';
import LibraryArticlePanel from './library/LibraryArticlePanel';
import { useSettings } from '../hooks/useSettingsContext';

const LibraryViewContent: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
            <LibrarySearchPanel />
            <LibraryArticlePanel />
        </div>
    );
}

const LibraryView: React.FC = () => {
    const { settings } = useSettings();
    if (!settings) return <div className="flex justify-center items-center h-full"><Spinner /></div>;

    return (
        <LibraryProvider>
            <LibraryViewContent />
        </LibraryProvider>
    );
};

export default memo(LibraryView);