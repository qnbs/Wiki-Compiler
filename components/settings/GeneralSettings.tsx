import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../../types';
import { useSettings } from '../../hooks/useSettingsContext';

const GeneralSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();

    if (!settings) return null;
    
    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('General')}</h2>

             <div className="space-y-2">
                <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Language')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("Choose the application's display language.")}</p>
                <select id="language-select" value={settings.language} onChange={e => updateSettings({ ...settings, language: e.target.value })} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none">
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Default View on Startup')}</label>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{t('Choose which view the application opens to on startup.')}</p>
                <select value={settings.defaultView} onChange={e => updateSettings({ ...settings, defaultView: e.target.value as View })} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none">
                    <option value={View.Library}>{t('Library')}</option>
                    <option value={View.Archive}>{t('Archive')}</option>
                    <option value={View.Compiler}>{t('Compiler')}</option>
                </select>
            </div>
        </div>
    );
};

export default GeneralSettings;