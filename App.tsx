import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from './i18n';
import { Project, View, Theme, AppSettings, AccentColor } from './types';
import { getProjects, saveProject, deleteProject as dbDeleteProject, getArticleCache, saveArticleCache, getSettings, saveSettings } from './services/dbService';
import { getArticleHtml as fetchArticleHtml } from './services/wikipediaService';
import Header from './components/Header';
import LibraryView from './components/LibraryView';
import ArchiveView from './components/ArchiveView';
import CompilerView from './components/CompilerView';
import SettingsView from './components/SettingsView';
import HelpView from './components/HelpView';
import CommandPalette from './components/CommandPalette';
import { useDarkMode } from './hooks/useDarkMode';
import BottomNavBar from './components/BottomNavBar';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [, setTheme, isDarkMode] = useDarkMode();


  const loadProjects = useCallback(async () => {
    let dbProjects = await getProjects();
    if (dbProjects.length === 0) {
      const newProject: Project = { id: crypto.randomUUID(), name: 'My First Compilation', articles: [] };
      await saveProject(newProject);
      dbProjects = [newProject];
    }
    setProjects(dbProjects);
  }, []);

  const loadInitialData = useCallback(async () => {
    let dbSettings = await getSettings();
    if (!dbSettings) {
      dbSettings = DEFAULT_SETTINGS;
      await saveSettings(dbSettings);
    }
    setSettings(dbSettings);
    setTheme(dbSettings.theme);
    setView(dbSettings.defaultView);
    if (i18next.language !== dbSettings.language) {
      i18next.changeLanguage(dbSettings.language);
    }
    await loadProjects();
  }, [loadProjects, setTheme]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
    setSettings(newSettings);
    setTheme(newSettings.theme);
    if (i18next.language !== newSettings.language) {
      await i18next.changeLanguage(newSettings.language);
    }
    await saveSettings(newSettings);
  }, [setTheme]);

  const toggleDarkMode = useCallback(() => {
    if (settings) {
      const newTheme = isDarkMode ? 'light' : 'dark';
      updateSettings({ ...settings, theme: newTheme });
    }
  }, [isDarkMode, settings, updateSettings]);

  useEffect(() => {
    if (projects.length > 0) {
        const activeProjectExists = projects.some(p => p.id === activeProjectId);
        if (!activeProjectId || !activeProjectExists) {
            setActiveProjectId(projects[0].id);
        }
    }
  }, [projects, activeProjectId]);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId)
  , [projects, activeProjectId]);

  const updateActiveProject = useCallback(async (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
    await saveProject(updatedProject);
  }, []);

  const addArticleToProject = useCallback((title: string) => {
    if (activeProject) {
      // Silently return if article is already in the project.
      // The UI will handle user feedback.
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
    let html = await getArticleCache(title);
    if (!html) {
      html = await fetchArticleHtml(title);
      await saveArticleCache({ title, html });
    }
    return html;
  }, []);

  const createNewProject = async () => {
    const newProjectName = prompt(t('Enter new project name:'), t('New Compilation'));
    if (newProjectName) {
      const newProject: Project = { id: crypto.randomUUID(), name: newProjectName, articles: [] };
      await saveProject(newProject);
      await loadProjects();
      setActiveProjectId(newProject.id);
      setView(View.Compiler);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (projects.length <= 1) {
      alert(t('You cannot delete the last project.'));
      return;
    }
    if (window.confirm(t('Delete Project Confirmation'))) {
      await dbDeleteProject(projectId);
      await loadProjects();
    }
  };

  const commands = useMemo(() => [
    { id: 'goto-library', label: 'Go to Library', action: () => setView(View.Library), icon: 'book' },
    { id: 'goto-archive', label: 'Go to Archive', action: () => setView(View.Archive), icon: 'archive-box' },
    { id: 'goto-compiler', label: 'Go to Compiler', action: () => setView(View.Compiler), icon: 'compiler' },
    { id: 'goto-settings', label: 'Settings', action: () => setView(View.Settings), icon: 'settings' },
    { id: 'goto-help', label: 'Help', action: () => setView(View.Help), icon: 'help' },
    { id: 'toggle-dark-mode', label: 'Toggle Dark Mode', action: toggleDarkMode, icon: isDarkMode ? 'sun' : 'moon' },
    { id: 'create-project', label: 'Create New Project', action: createNewProject, icon: 'plus' },
  ], [isDarkMode, toggleDarkMode, createNewProject]);


  const renderContent = () => {
    if (!settings) {
      return null; // Or a loading spinner
    }
    switch (view) {
        case View.Library:
            return activeProject && <LibraryView addArticleToProject={addArticleToProject} getArticleContent={getArticleContent} settings={settings} activeProject={activeProject} />;
        case View.Archive:
            return activeProject && <ArchiveView addArticleToProject={addArticleToProject} getArticleContent={getArticleContent} activeProject={activeProject} settings={settings} />;
        case View.Compiler:
            return activeProject && <CompilerView project={activeProject} updateProject={updateActiveProject} getArticleContent={getArticleContent} settings={settings} updateSettings={updateSettings} />;
        case View.Settings:
            return <SettingsView settings={settings} updateSettings={updateSettings} reloadApp={loadInitialData} />;
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
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        projectName={activeProject?.name || ''}
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