import React, { useState, useEffect, useCallback } from 'react';
import { View } from './types';
import { useSettings } from './hooks/useSettingsContext';
import { getArticleHtml, getArticleMetadata } from './services/wikipediaService';
import { getArticleCache, saveArticleCache } from './services/dbService';

import Header from './components/Header';
import LibraryView from './components/LibraryView';
import ArchiveView from './components/ArchiveView';
import CompilerView from './components/CompilerView';
import ImporterView from './components/ImporterView';
import ImageImporterView from './components/ImageImporterView';
import SettingsView from './components/SettingsView';
import HelpView from './components/HelpView';
import BottomNavBar from './components/BottomNavBar';
import ToastContainer from './components/ToastContainer';
import CommandPalette from './components/CommandPalette';
import WelcomeModal from './components/WelcomeModal';
import Spinner from './components/Spinner';

const accentColorMap: { [key: string]: string } = {
  blue: '39 110 241',
  purple: '124 58 237',
  green: '22 163 74',
  orange: '234 88 12',
  red: '220 38 38',
};

const ThemeManager = () => {
    const { settings } = useSettings();

    useEffect(() => {
        if (!settings) return;
        const root = document.documentElement;

        // Accent Color
        root.style.setProperty('--accent-color', accentColorMap[settings.accentColor]);

        // Theme
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        const applyTheme = () => {
            if (settings.theme === 'dark' || (settings.theme === 'system' && systemPrefersDark.matches)) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        };

        applyTheme();

        systemPrefersDark.addEventListener('change', applyTheme);
        return () => systemPrefersDark.removeEventListener('change', applyTheme);

    }, [settings]);

    return null;
};


const App: React.FC = () => {
  const { settings } = useSettings();
  const [view, setView] = useState<View | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setView(settings.defaultView);
      const hasOnboarded = localStorage.getItem('wiki-compiler-onboarded');
      if (!hasOnboarded) {
        setIsWelcomeModalOpen(true);
      }
    }
  }, [settings]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
        const swContent = `
            const CACHE_NAME = 'wiki-compiler-cache-v1';
            const APP_SHELL_URLS = ['/', '/index.html'];

            self.addEventListener('install', (event) => {
              event.waitUntil(
                caches.open(CACHE_NAME)
                  .then((cache) => cache.addAll(APP_SHELL_URLS))
                  .then(() => self.skipWaiting())
              );
            });

            self.addEventListener('activate', (event) => {
              const cacheWhitelist = [CACHE_NAME];
              event.waitUntil(
                caches.keys().then((cacheNames) =>
                  Promise.all(
                    cacheNames.map((cacheName) => {
                      if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                      }
                    })
                  )
                ).then(() => self.clients.claim())
              );
            });

            self.addEventListener('fetch', (event) => {
              if (event.request.method !== 'GET') {
                return;
              }
              
              event.respondWith(
                fetch(event.request)
                  .then((response) => {
                    if (response && response.status === 200) {
                      const responseToCache = response.clone();
                      caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                      });
                    }
                    return response;
                  })
                  .catch(() => {
                    return caches.match(event.request).then((cachedResponse) => {
                      if (cachedResponse) {
                        return cachedResponse;
                      }
                      return new Response('<h1>You are offline</h1><p>This content is not available offline.</p>', { headers: { 'Content-Type': 'text/html' } });
                    });
                  })
              );
            });
        `;
        const blob = new Blob([swContent], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(swUrl)
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
}, []);

  const getArticleContent = useCallback(async (title: string): Promise<string> => {
    const cachedArticle = await getArticleCache(title);
    if (cachedArticle) {
      return cachedArticle.html;
    }
    const html = await getArticleHtml(title);
    const metadataArray = await getArticleMetadata([title]);
    await saveArticleCache({
      title,
      html,
      metadata: metadataArray.length > 0 ? metadataArray[0] : undefined,
    });
    return html;
  }, []);
  
  const commands = [
    { id: 'goto-library', label: 'Go to Library', action: () => setView(View.Library), icon: 'book' },
    { id: 'goto-archive', label: 'Go to Archive', action: () => setView(View.Archive), icon: 'archive-box' },
    { id: 'goto-compiler', label: 'Go to Compiler', action: () => setView(View.Compiler), icon: 'compiler' },
    { id: 'goto-importer', label: 'Go to Importer', action: () => setView(View.Importer), icon: 'upload' },
    { id: 'goto-image-importer', label: 'Go to Image Importer', action: () => setView(View.ImageImporter), icon: 'palette' },
    { id: 'goto-settings', label: 'Settings', action: () => setView(View.Settings), icon: 'settings' },
    { id: 'goto-help', label: 'Help', action: () => setView(View.Help), icon: 'help' },
  ];

  const renderView = () => {
    switch (view) {
      case View.Library:
        return <LibraryView getArticleContent={getArticleContent} />;
      case View.Archive:
        return <ArchiveView />;
      case View.Compiler:
        return <CompilerView getArticleContent={getArticleContent} />;
      case View.Importer:
        return <ImporterView getArticleContent={getArticleContent} />;
      case View.ImageImporter:
        return <ImageImporterView />;
      case View.Settings:
        return <SettingsView />;
      case View.Help:
        return <HelpView />;
      default:
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }
  };

  if (!view || !settings) {
    return <div className="w-screen h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900"><Spinner /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900/95 text-gray-900 dark:text-gray-100">
      <ThemeManager />
      <Header view={view} setView={setView} openCommandPalette={() => setIsCommandPaletteOpen(true)} />
      <main className="flex-grow overflow-auto p-4 sm:p-6 mb-16 sm:mb-0">
        {renderView()}
      </main>
      <BottomNavBar view={view} setView={setView} />
      <ToastContainer />
      <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen} commands={commands} />
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
    </div>
  );
};

export default App;