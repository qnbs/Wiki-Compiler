import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCacheSize, clearArticleCache, exportAllData, importAllData } from '../../services/dbService';
import { useToasts } from '../../hooks/useToasts';
import { useProjects } from '../../hooks/useProjectsContext';
import { useSettings } from '../../hooks/useSettingsContext';
import Icon from '../Icon';
import Spinner from '../Spinner';
import saveAs from 'file-saver';

const StorageSettings: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const { reloadProjects } = useProjects();
    const { reloadSettings } = useSettings();
    
    const [cacheInfo, setCacheInfo] = useState<{ count: number; size: number }>({ count: 0, size: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [backupExists, setBackupExists] = useState(false);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };
    
    useEffect(() => {
        const fetchCacheInfo = async () => {
            setIsLoading(true);
            const info = await getCacheSize();
            setCacheInfo(info);
            setIsLoading(false);
        };
        fetchCacheInfo();

        if (sessionStorage.getItem('wiki-compiler-backup')) {
            setBackupExists(true);
        }
    }, []);

    const handleClearCache = async () => {
        if (window.confirm(t('Are you sure you want to clear the cache?'))) {
            await clearArticleCache();
            setCacheInfo({ count: 0, size: 0 });
            addToast(t('Cache cleared successfully!'), 'success');
        }
    };
    
    const handleExport = async () => {
        try {
            const jsonString = await exportAllData();
            const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
            saveAs(blob, `wiki-compiler-backup-${new Date().toISOString().split('T')[0]}.json`);
        } catch (error) {
            addToast(t('Export failed.'), 'error');
            console.error(error);
        }
    };
    
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (window.confirm(t('Importing data will overwrite all current projects and settings. Are you sure you want to continue?'))) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const jsonString = e.target?.result as string;
                    await importAllData(jsonString, true);
                    setBackupExists(true);
                    addToast(t('Import successful! The app will now reload.'), 'success');
                    setTimeout(() => {
                        reloadProjects();
                        reloadSettings();
                        window.location.reload();
                    }, 1500);
                } catch (error) {
                    addToast(t('Import failed. Please check the file format.'), 'error');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    };

    const handleRestore = async () => {
        if (window.confirm(t('Are you sure you want to restore the pre-import backup? This will overwrite all current data.'))) {
            const backupData = sessionStorage.getItem('wiki-compiler-backup');
            if (backupData) {
                try {
                    await importAllData(backupData, false);
                    sessionStorage.removeItem('wiki-compiler-backup');
                    setBackupExists(false);
                    addToast(t('Backup restored successfully! The app will now reload.'), 'success');
                    setTimeout(() => {
                        reloadProjects();
                        reloadSettings();
                        window.location.reload();
                    }, 1500);
                } catch (e) {
                    addToast(t('Restore failed.'), 'error');
                    console.error("Restore failed:", e);
                }
            }
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('Data & Storage')}</h2>
            
            {backupExists && (
                <div className="space-y-2 p-4 bg-yellow-50 dark:bg-yellow-900/40 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-500">
                    <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200">{t('Restore Pre-Import Backup')}</label>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">{t('A backup was created before your last import. You can restore it if something went wrong.')}</p>
                    <button onClick={handleRestore} className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-semibold">
                        <Icon name="arrow-left" className="w-4 h-4" /> {t('Restore Backup')}
                    </button>
                </div>
            )}

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Cache Usage')}</label>
                {isLoading ? <Spinner /> : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('{{count}} articles cached, using', { count: cacheInfo.count })} {formatBytes(cacheInfo.size)}
                    </p>
                )}
                 <button onClick={handleClearCache} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400">
                    <Icon name="trash" className="w-4 h-4" /> {t('Clear Article Cache')}
                </button>
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Export All Data')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Save a backup of all your projects, cached articles, and settings to a JSON file.')}</p>
                <button onClick={handleExport} className="flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm font-semibold">
                    <Icon name="download" className="w-4 h-4" /> {t('Export...')}
                </button>
            </div>
            
            <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Import Data')}</label>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{t('Restore your application from a backup file. WARNING: This will overwrite all current projects, articles, and settings.')}</p>
                <input type="file" id="import-file" accept=".json" onChange={handleImport} className="hidden" />
                <label htmlFor="import-file" className="cursor-pointer inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold">
                    <Icon name="upload" className="w-4 h-4" /> {t('Import...')}
                </label>
            </div>
        </div>
    );
};

export default StorageSettings;