import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from './i18n';
import { View, Theme, AppSettings, AccentColor, ArticleContent } from './types';
import { getArticleCache, saveArticleCache, getSettings, saveSettings } from './services/dbService';
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
import { useProjects } from './hooks/useProjects';
import Spinner from './components/Spinner';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  accentColor: 'blue',
  defaultView: View.Library,
  library: {
    searchResultLimit: 10,
    aiAssistant: {
      enabled: true,
      systemInstruction: '',
    },
  },
  compiler: {
    defaultPdfOptions: {
      paperSize: 'letter',
      layout: 'single',
      includeTOC: true,
      includeBibliography: true,
      citationStyle: 'apa',
      typography: {
        fontPair: 'modern',
        fontSize: 16,
      },
      margins: 'normal',
      lineSpacing: 1.5,
      headerContent: 'title',
      footerContent: 'pageNumber',
      customHeaderText: '',
      customFooterText: '',
    }
  }
};

const accentColorMap: Record<AccentColor, Record<string, string>> = {
  blue: {
    '50': '239 246 255', '100': '219 234 254', '200': '191 219 254', '300': '147 197 253', '400': '96 165 250', '500': '59 130 246', '600': '37 99 235', '700': '29 78 216', '800': '30 64 175', '900': '30 58 138'
  },
  purple: {
    '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253', '400': '167 139 250', '500': '139 92 246', '600': '124 58 237', '700': '109 40 217', '800': '91 33 182', '900': '76 29 149'
  },
  green: {
    '50': '240 253 244', '100': '220 252 231', '200': '187 247 208', '300': '134 239 172', '400': '74 222 128', '500': '34 197 94', '600': '22 163 74', '700': '21 128 61', '800': '22 101 52', '900': '20 83 45'
  },
  orange: {
    '50': '255 247 237', '100': '255 237 213', '200': '254 215 170', '300': '253 186 116', '400': '251 146 60', '500': '249 115 22', '600': '234 88 12', '700': '194 65 12', '800': '154 52 18', '900': '124 45 18'
  }
};


const App: React.FC = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<View>(View.Library);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  useDarkMode(settings?.theme);
  const { 
    projects, 
    activeProjectId, 
    activeProject, 
    setActiveProjectId, 
    updateActiveProject, 
    createNewProject, 
    deleteProject,
    loadProjects
  } = useProjects(setView);


  const loadInitialSettings = useCallback(async () => {
    let dbSettings = await getSettings();
    if (!dbSettings) {
      dbSettings = DEFAULT_SETTINGS;
    } else {
      // Force dark theme to override any previously saved user preference.
      dbSettings.theme = 'dark';
    }
    await saveSettings(dbSettings); // Persist the change.
    setSettings(dbSettings);
    setView(dbSettings.defaultView);
    if (i18next.language !== dbSettings.language) {
      i18next.changeLanguage(dbSettings.language);
    }
  }, []);

  useEffect(() => {
    loadInitialSettings();
  }, [loadInitialSettings]);
  
  const reloadApp = useCallback(() => {
    loadInitialSettings();
    loadProjects();
  },[loadInitialSettings, loadProjects]);

  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      const colors = accentColorMap[settings.accentColor];
      for (const [shade, value] of Object.entries(colors)) {
        root.style.setProperty(`--color-accent-${shade}`, String(value));
      }
    }
  }, [settings?.accentColor]);
  
  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    // Ensure that any settings update always enforces dark mode.
    const forcedDarkSettings: AppSettings = { ...newSettings, theme: 'dark' };
    setSettings(forcedDarkSettings);
    if (i18next.language !== forcedDarkSettings.language) {
      await i18next.changeLanguage(forcedDarkSettings.language);
    }
    await saveSettings(forcedDarkSettings);
  }, []);

  const addArticleToProject = useCallback((title: string) => {
    if (activeProject) {
      if (activeProject.articles.some(a => a.title === title)) {
        return;
      }
      const newArticle = { title };
      const updatedProject = {
        ...activeProject,
        articles: [...activeProject.articles, newArticle],
      };
      updateActiveProject(updatedProject);
    }
  }, [activeProject, updateActiveProject]);

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
    { id: 'goto-library', label: 'Go to Library', action: () => setView(View.Library), icon: 'book' },
    { id: 'goto-archive', label: 'Go to Archive', action: () => setView(View.Archive), icon: 'archive-box' },
    { id: 'goto-compiler', label: 'Go to Compiler', action: () => setView(View.Compiler), icon: 'compiler' },
    { id: 'goto-settings', label: 'Settings', action: () => setView(View.Settings), icon: 'settings' },
    { id: 'goto-help', label: 'Help', action: () => setView(View.Help), icon: 'help' },
    { id: 'create-project', label: 'Create New Project', action: createNewProject, icon: 'plus' },
  ], [createNewProject]);

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
            return <LibraryView addArticleToProject={addArticleToProject} getArticleContent={getArticleContent} settings={settings} activeProject={activeProject} />;
        case View.Archive:
            return <ArchiveView addArticleToProject={addArticleToProject} getArticleContent={getArticleContent} activeProject={activeProject} settings={settings} />;
        case View.Compiler:
            return <CompilerView project={activeProject} updateProject={updateActiveProject} getArticleContent={getArticleContent} settings={settings} updateSettings={updateSettings} />;
        case View.Settings:
            return <SettingsView settings={settings} updateSettings={updateSettings} reloadApp={reloadApp} />;
        case View.Help:
            return <HelpView />;
        default:
            return null;
    }
  }


  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header 
        view={view} 
        setView={setView} 
        projectName={activeProject.name}
        projects={projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        createNewProject={createNewProject}
        deleteProject={deleteProject}
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