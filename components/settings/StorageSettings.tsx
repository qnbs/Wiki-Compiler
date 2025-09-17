import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getCacheSize, clearArticleCache, exportAllData, importAllData } from '../../services/dbService';
import { useToasts } from '../../hooks/useToasts';
import Icon from '../Icon';
import { useSettings } from '../../hooks/useSettingsContext';
import { useProjects } from '../../hooks/useProjectsContext';
import { useImageImporter } from '../../hooks/useImageImporterContext';
import { useImporter } from '../../hooks/useImporterContext';

const StorageSettings: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const { reloadSettings } = useSettings();
    const { reloadProjects } = useProjects();
    const { loadImportedImages } = useImageImporter();
    const { clearImporter } = useImporter();
    const [cacheInfo, setCacheInfo] = useState({ count: 0, size: 0 });
    const importFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getCacheSize().then(setCacheInfo);
    }, []);

    const handleClearCache = async () => {
        if (window.confirm(t('Are you sure you want to clear the cache?'))) {
            await clearArticleCache();
            getCacheSize().then(setCacheInfo);
            addToast(t('Cache cleared successfully!'), 'success');
        }
    };

    const handleExport = async () => {
        try {
            const jsonData = await exportAllData();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
            link.download = `wiki_compiler_backup_${timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            addToast(t('Export failed.'), 'error');
        }
    };

    const handleImportClick = () => {
        if (importFileRef.current) {
            importFileRef.current.click();
        }
    };

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (window.confirm(t('Importing data will overwrite all current projects and settings. Are you sure you want to continue?'))) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        await importAllData(event.target?.result as string);
                        addToast(t('Import successful!'), 'success');
                        await Promise.all([
                            reloadSettings(),
                            reloadProjects(),
                            loadImportedImages(),
                        ]);
                        clearImporter();
                    } catch (error) {
                        console.error("Import failed:", error);
                        addToast(t('Import failed. Please check the file format.'), 'error');
                    }
                };
                reader.readAsText(file);
            }
        }
        // Reset file input to allow re-importing the same file
        e.target.value = '';
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('Data & Storage')}</h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <h3 className="font-semibold">{t('Cache Usage')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('{{count}} articles cached, using', { count: cacheInfo.count })} {formatBytes(cacheInfo.size)}</p>
                <button onClick={handleClearCache} className="mt-2 text-sm text-red-600 hover:underline">{t('Clear Article Cache')}</button>
            </div>
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold">{t('Export All Data')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('Save a backup of all your projects, cached articles, and settings to a JSON file.')}</p>
                    <button onClick={handleExport} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold">
                        <Icon name="download" className="w-4 h-4" /> {t('Export...')}
                    </button>
                </div>
                 <div>
                    <h3 className="font-semibold">{t('Import Data')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('Restore your application from a backup file. WARNING: This will overwrite all current projects, articles, and settings.')}</p>
                    <button onClick={handleImportClick} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold">
                        <Icon name="upload" className="w-4 h-4" /> {t('Import...')}
                    </button>
                    <input type="file" accept=".json" ref={importFileRef} onChange={onFileSelected} className="hidden" />
                </div>
            </div>
        </div>
    );
};

export default StorageSettings;