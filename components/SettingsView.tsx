import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import GeneralSettings from './settings/GeneralSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import LibrarySettings from './settings/LibrarySettings';
import CitationSettings from './settings/CitationSettings';
import StorageSettings from './settings/StorageSettings';
import AboutSettings from './settings/AboutSettings';

const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('general');

  const sections = {
    general: { label: 'General', icon: 'settings', component: <GeneralSettings /> },
    appearance: { label: 'Appearance', icon: 'palette', component: <AppearanceSettings /> },
    library: { label: 'Library', icon: 'book', component: <LibrarySettings /> },
    citations: { label: 'Citations', icon: 'key', component: <CitationSettings /> },
    storage: { label: 'Storage', icon: 'archive-box', component: <StorageSettings /> },
    about: { label: 'About', icon: 'info', component: <AboutSettings /> },
  };

  return (
    <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('Settings')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <nav className="space-y-1">
                    {Object.entries(sections).map(([key, {label, icon}]) => (
                        <button 
                            key={key} 
                            onClick={() => setActiveSection(key)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === key ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                        >
                            <Icon name={icon} className="w-5 h-5"/>
                            <span>{t(label)}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="md:col-span-3">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
                    {sections[activeSection as keyof typeof sections].component}
                </div>
            </main>
        </div>
    </div>
  );
};

export default memo(SettingsView);