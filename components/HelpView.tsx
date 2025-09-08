import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

const HelpView: React.FC = () => {
  const { t } = useTranslation();

  const HelpSection: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border dark:border-gray-700/50">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-3">
        <Icon name={icon} className="w-7 h-7 text-accent-500" />
        <span>{t(title)}</span>
      </h2>
      <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Icon name="help" className="w-16 h-16 mx-auto text-accent-500 mb-4" />
        <h1 className="text-4xl font-bold">{t('How can we help?')}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{t('Welcome to Wiki Compiler!')}</p>
        <p className="text-gray-500 dark:text-gray-400">{t('This guide will walk you through the main features of the application.')}</p>
      </div>

      <div className="space-y-8">
        <HelpSection title="The Library View" icon="book">
            <p>{t('The Library is your starting point for research. Here you can:')}</p>
            <ul>
                <li><strong>{t('Search')}:</strong> {t('Search for Wikipedia articles using the search bar.')}</li>
                <li><strong>{t('Preview')}:</strong> {t('Preview articles by clicking on them in the search results.')}</li>
                <li><strong>{t('Analyze')}:</strong> {t('Generate AI-powered summaries of articles for a quick overview.')}</li>
                <li><strong>{t('Curate')}:</strong> {t('Add articles to your current compilation project.')}</li>
            </ul>
            <p className="mt-4 text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
              <Icon name="info" className="w-4 h-4 inline mr-1" />
              {t('Every article you preview is automatically saved to your local Archive for offline access.')}
            </p>
        </HelpSection>
        
        <HelpSection title="The Archive View" icon="archive-box">
            <p>{t('The Archive contains every Wikipedia article you have ever viewed in the app, available completely offline.')}</p>
            <ul>
                <li><strong>{t('Offline Access')}:</strong> {t('Read all your previously viewed articles without an internet connection.')}</li>
                <li><strong>{t('Search')}:</strong> {t('Quickly find articles within your personal cache.')}</li>
                <li><strong>{t('Manage')}:</strong> {t('Delete articles from the cache to save space.')}</li>
            </ul>
        </HelpSection>

        <HelpSection title="The Compiler View" icon="compiler">
            <p>{t('The Compiler is where you assemble and customize your knowledge compilation. In this view, you can:')}</p>
            <ul>
                <li><strong>{t('Assemble')}:</strong> {t('View all articles in your compilation.')}</li>
                <li><strong>{t('Reorder')}:</strong> {t('Reorder articles by dragging and dropping them, or use the accessible arrow buttons.')}</li>
                <li><strong>{t('Customize')}:</strong> {t('Use the "Settings & Export" panel to customize paper size, layout, fonts, margins, custom headers/footers, and more.')}</li>
                <li><strong>{t('Export')}:</strong> {t('Export your final compilation as a professional-looking PDF or a flexible Markdown file.')}</li>
            </ul>
        </HelpSection>
        
        <HelpSection title="Managing Projects" icon="document">
            <p>{t('You can work on multiple compilations at once. Use the project dropdown in the header to:')}</p>
            <ul>
                <li>{t('Create new projects.')}</li>
                <li>{t('Switch between existing projects.')}</li>
                <li>{t('Delete projects.')}</li>
            </ul>
        </HelpSection>

        <HelpSection title="Settings" icon="settings">
            <p>{t('Customize the application to fit your workflow. In the Settings view, you can manage:')}</p>
            <ul>
                <li><strong>{t('Appearance')}:</strong> {t('Choose your theme (Light, Dark, System) and accent color.')}</li>
                <li><strong>{t('General')}:</strong> {t('Set your preferred language and the default view that opens on startup.')}</li>
                <li><strong>{t('Library & AI')}:</strong> {t('Control the number of search results and configure the AI Research Assistant with custom instructions.')}</li>
                <li><strong>{t('Data & Storage')}:</strong> {t('Clear your article cache to save space, and importantly, use the Export/Import feature to back up and restore all your app data.')}</li>
            </ul>
        </HelpSection>

        <HelpSection title="Command Palette" icon="command">
          <p>{t('For quick navigation and actions, use the Command Palette.')} <span className="font-semibold">{t('Press')} <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">⌘K</kbd> {t('or')} <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Ctrl+K</kbd> {t('to open it.')}</span></p>
          <p>{t('From there, you can type to find actions like switching views, creating projects, or exporting.')}</p>
        </HelpSection>

        <HelpSection title="Experimenting with Google AI Studio" icon="beaker">
          <p>{t('aiStudioHelpIntro')}</p>
          <p>{t('aiStudioHelpLinkText')} <a href="https://ai.studio/apps/drive/1yyz5W0rD85UmlKj6X2vkwrX-SGMrQQmZ" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-600 dark:text-accent-400 hover:underline">{t('aiStudioHelpLinkName')}</a>.</p>
        </HelpSection>
      </div>
    </div>
  );
};

export default HelpView;