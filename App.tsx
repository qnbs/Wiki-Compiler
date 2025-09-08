import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, ArticleContent } from './types';
// FIX: `getArticleMetadata` is exported from `wikipediaService`, not `dbService`.
import { getArticleCache, saveArticleCache } from './services/dbService';
import { getArticleHtml as fetchArticleHtml, getArticleMetadata } from './services/wikipediaService';
import Header from './components/Header';
import LibraryView from './components/LibraryView';
import ArchiveView from './components/ArchiveView';
import CompilerView from './components/CompilerView';
import SettingsView from './components/SettingsView';
import HelpView from './components/HelpView';
import CommandPalette from './components/CommandPalette';
import { useDarkMode } from './hooks/useDarkMode';
import BottomNavBar from './components/BottomNavBar';
import Spinner from './components/Spinner';
import { useSettings } from './hooks/useSettingsContext';
import { useProjects } from './hooks/useProjectsContext';
import ToastContainer from './components/ToastContainer';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<View>(View.Library);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const { settings, accentColorMap, reloadSettings } = useSettings();
  const { activeProject, createNewProject, reloadProjects } = useProjects();
  
  useDarkMode();

  useEffect(() => {
    if (settings) {
      setView(settings.defaultView);
    }
  }, [settings?.defaultView]);

  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      const colors = accentColorMap[settings.accentColor];
      for (const [shade, value] of Object.entries(colors)) {
        root.style.setProperty(`--color-accent-${shade}`, String(value));
      }
    }
  }, [settings?.accentColor, accentColorMap]);

  const reloadApp = useCallback(() => {
    reloadSettings();
    reloadProjects();
  },[reloadSettings, reloadProjects]);

  const getArticleContent = useCallback(async (title: string): Promise<string> => {
    let article = await getArticleCache(title);
    if (!article) {
      const html = await fetchArticleHtml(title);
      const metadataArray = await getArticleMetadata([title]);
      const articleToCache: ArticleContent = { 
        title, 
        html, 
        metadata: metadataArray.length > 0 ? metadataArray[0] : undefined 
      };
      await saveArticleCache(articleToCache);
      return html;
    }
    return article.html;
  }, []);

  const commands = useMemo(() => [
    { id: 'goto-library', label: t('Go to Library'), action: () => setView(View.Library), icon: 'book' },
    { id: 'goto-archive', label: t('Go to Archive'), action: () => setView(View.Archive), icon: 'archive-box' },
    { id: 'goto-compiler', label: t('Go to Compiler'), action: () => setView(View.Compiler), icon: 'compiler' },
    { id: 'goto-settings', label: t('Settings'), action: () => setView(View.Settings), icon: 'settings' },
    { id: 'goto-help', label: t('Help'), action: () => setView(View.Help), icon: 'help' },
    { id: 'create-project', label: t('Create New Project'), action: () => createNewProject(() => setView(View.Compiler)), icon: 'plus' },
  ], [t, createNewProject]);

  if (!settings || !activeProject) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
        case View.Library:
            return <LibraryView getArticleContent={getArticleContent} />;
        case View.Archive:
            return <ArchiveView getArticleContent={getArticleContent} />;
        case View.Compiler:
            return <CompilerView getArticleContent={getArticleContent} />;
        case View.Settings:
            return <SettingsView reloadApp={reloadApp} />;
        case View.Help:
            return <HelpView />;
        default:
            return null;
    }
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <ToastContainer />
      <Header 
        view={view} 
        setView={setView} 
        openCommandPalette={() => setIsCommandPaletteOpen(true)}
      />
       <CommandPalette
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
        commands={commands}
      />
      <main className="p-4 sm:p-6 lg:p-8 pb-20 sm:pb-6 lg:pb-8">
        {renderContent()}
      </main>
      <BottomNavBar view={view} setView={setView} />
    </div>
  );
};

export default App;