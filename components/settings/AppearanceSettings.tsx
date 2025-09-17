import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettingsContext';
import { Theme, AccentColorName } from '../../types';
import Icon from '../Icon';

const AppearanceSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();

    if (!settings) return null;

    const accentColors: { name: AccentColorName, label: string, bgClass: string }[] = [
        { name: 'blue', label: 'Blue', bgClass: 'bg-blue-500' },
        { name: 'purple', label: 'Purple', bgClass: 'bg-purple-500' },
        { name: 'green', label: 'Green', bgClass: 'bg-green-500' },
        { name: 'orange', label: 'Orange', bgClass: 'bg-orange-500' },
        { name: 'red', label: 'Red', bgClass: 'bg-red-500' },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('Appearance')}</h2>
            
            <fieldset className="space-y-2">
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Theme')}</legend>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Choose your preferred color theme.')}</p>
                <div className="flex flex-wrap gap-4 pt-2">
                    {(['light', 'dark', 'system'] as Theme[]).map(theme => (
                        <div key={theme} className="flex items-center">
                            <input
                                id={`theme-${theme}`}
                                name="theme"
                                type="radio"
                                value={theme}
                                checked={settings.theme === theme}
                                onChange={e => updateSettings({ ...settings, theme: e.target.value as Theme })}
                                className="h-4 w-4 border-gray-300 text-accent-600 focus:ring-accent-500"
                            />
                            <label htmlFor={`theme-${theme}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-200 capitalize">
                                {t(theme.charAt(0).toUpperCase() + theme.slice(1))}
                            </label>
                        </div>
                    ))}
                </div>
            </fieldset>

            <fieldset className="space-y-2">
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Accent Color')}</legend>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Choose the main color for UI elements.')}</p>
                 <div className="flex flex-wrap gap-3 pt-2">
                    {accentColors.map(color => (
                        <button
                            key={color.name}
                            type="button"
                            onClick={() => updateSettings({ ...settings, accentColor: color.name })}
                            className={`w-10 h-10 rounded-full ${color.bgClass} flex items-center justify-center ring-2 ring-offset-2 dark:ring-offset-gray-800 transition-all ${settings.accentColor === color.name ? 'ring-gray-800 dark:ring-gray-200' : 'ring-transparent hover:ring-gray-400'}`}
                            aria-label={t(color.label)}
                        >
                            {settings.accentColor === color.name && <Icon name="check" className="w-5 h-5 text-white" />}
                        </button>
                    ))}
                </div>
            </fieldset>
        </div>
    );
};

export default AppearanceSettings;
