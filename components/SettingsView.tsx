import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

import GeneralSettings from './settings/GeneralSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import LibrarySettings from './settings/LibrarySettings';
import CitationSettings from './settings/CitationSettings';
import StorageSettings from './settings/StorageSettings';
import AboutSettings from './settings/AboutSettings';

type SettingsTab = 'general' | 'appearance' | 'library' | 'citations' | 'storage' | 'about';

const SettingsView: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    const tabs: { id: SettingsTab; label: string; icon: string }[] = [
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'appearance', label: 'Appearance', icon: 'palette' },
        { id: 'library', label: 'Library Settings', icon: 'book' },
        { id: 'citations', label: 'Citations', icon: 'document' },
        { id: 'storage', label: 'Storage', icon: 'archive-box' },
        { id: 'about', label: 'About', icon: 'info' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings />;
            case 'appearance': return <AppearanceSettings />;
            case 'library': return <LibrarySettings />;
            case 'citations': return <CitationSettings />;
            case 'storage': return <StorageSettings />;
            case 'about': return <AboutSettings />;
            default: return null;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <aside className="md:col-span-3">
                <nav className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <Icon name={tab.icon} className="w-5 h-5" />
                            <span>{t(tab.label)}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <div className="md:col-span-9">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
