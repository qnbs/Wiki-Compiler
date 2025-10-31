import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from './hooks/useSettingsContext';
import Header from './components/Header';
import LibraryView from './components/LibraryView';
import CompilerView from './components/CompilerView';
import ArchiveView from './components/ArchiveView';
import ImporterView from './components/ImporterView';
import ImageImporterView from './components/ImageImporterView';
import SettingsView from './components/SettingsView';
import HelpView from './components/HelpView';
import BottomNavBar from './components/BottomNavBar';
import CommandPalette from './components/CommandPalette';
import WelcomeModal from './components/WelcomeModal';
import ToastContainer from './components/ToastContainer';
import Spinner from './components/Spinner';
import { View } from './types';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function App() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const isOnline = useOnlineStatus();

  const [view, setView] = useState<View>(View.Library);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(localStorage.getItem('wiki-compiler-onboarded') === 'true');

  useEffect(() => {
    if (settings) {
      const urlParams = new URLSearchParams(window.location.search);
      const viewFromUrl = urlParams.get('view') as View;

      if (viewFromUrl && Object.values(View).includes(viewFromUrl)) {
        setView(viewFromUrl);
        // Clean up the URL to avoid confusion on subsequent navigations
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        setView(settings.defaultView);
      }
    }
  }, [settings]);

  useEffect(() => {
    if (settings) {
      document.documentElement.setAttribute('data-accent-color', settings.accentColor);
      if (settings.theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', systemPrefersDark);
      } else {
        document.documentElement.classList.toggle('dark', settings.theme === 'dark');
      }
    }
  }, [settings]);

  const handleSetView = (newView: View) => {
    setView(newView);
    window.scrollTo(0, 0); // Scroll to top on view change
  };
  
  const openCommandPalette = () => setCommandPaletteOpen(true);
  
  const commands = useMemo(() => [
    { id: 'goto_library', label: 'Go to Library', action: () => handleSetView(View.Library), icon: 'book' },
    { id: 'goto_archive', label: 'Go to Archive', action: () => handleSetView(View.Archive), icon: 'archive-box' },
    { id: 'goto_compiler', label: 'Go to Compiler', action: () => handleSetView(View.Compiler), icon: 'compiler' },
    { id: 'goto_importer', label: 'Go to Importer', action: () => handleSetView(View.Importer), icon: 'upload' },
    { id: 'goto_image_importer', label: 'Image Importer', action: () => handleSetView(View.ImageImporter), icon: 'palette' },
    { id: 'goto_settings', label: 'Settings', action: () => handleSetView(View.Settings), icon: 'settings' },
    { id: 'goto_help', label: 'Help', action: () => handleSetView(View.Help), icon: 'help' },
  ], [t]);

  const renderView = () => {
    switch (view) {
      case View.Library:
        return <LibraryView />;
      case View.Compiler:
        return <CompilerView />;
      case View.Archive:
          return <ArchiveView />;
      case View.Importer:
          return <ImporterView />;
      case View.ImageImporter:
          return <ImageImporterView />;
      case View.Settings:
        return <SettingsView />;
      case View.Help:
        return <HelpView />;
      default:
        return <LibraryView />;
    }
  };

  if (!settings) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header view={view} setView={handleSetView} openCommandPalette={openCommandPalette} isOnline={isOnline} />
      <main className="max-w-7xl mx-auto p-4 sm:pb-24">
        {renderView()}
      </main>
      <BottomNavBar view={view} setView={handleSetView} isOnline={isOnline} />
      <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setCommandPaletteOpen} commands={commands} />
      <WelcomeModal isOpen={!hasOnboarded} onClose={() => setHasOnboarded(true)} />
      <ToastContainer />
    </div>
  );
}

export default App;
