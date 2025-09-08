import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, AccentColor } from '../../types';
import { useSettings } from '../../hooks/useSettingsContext';

const GeneralSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();

    if (!settings) return null;

    const accentColors: { name: AccentColor, className: string, label: string }[] = [
      { name: 'blue', className: 'bg-blue-500', label: 'Blue' },
      { name: 'purple', className: 'bg-purple-500', label: 'Purple' },
      { name: 'green', className: 'bg-green-500', label: 'Green' },
      { name: 'orange', className: 'bg-orange-500', label: 'Orange' },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('General')}</h2>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Accent Color')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Customize the UI highlights, buttons, and active states throughout the application.')}</p>
                <div className="flex gap-3 pt-2">
                    {accentColors.map(color => (
                        <button key={color.name} onClick={() => updateSettings({ ...settings, accentColor: color.name })}
                            className={`w-8 h-8 rounded-full ${color.className} transition-transform hover:scale-110 ${settings.accentColor === color.name ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-accent-500' : ''}`}
                            aria-label={t(color.label)}
                        />
                    ))}
                </div>
            </div>
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