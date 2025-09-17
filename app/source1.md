# Wiki Compiler: Quellcode-Dokumentation (Teil 2: State Management - Contexts & Hooks)

Dieses Dokument enthält den Quellcode für die gesamte Zustandsverwaltung der Anwendung, einschließlich aller React Contexts und benutzerdefinierten Hooks.

---

## `contexts/ImageImporterContext.tsx`

```typescript
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ImportedImage } from '../types';
import { getImportedImages, saveImportedImage, deleteImportedImage as dbDeleteImportedImage } from '../services/dbService';

interface ImageImporterContextType {
  // Staging area state and functions
  stagedImages: ImportedImage[];
  addImagesToStaging: (images: Omit<ImportedImage, 'id' | 'tags' | 'category' | 'notes'>[]) => Promise<void>;
  updateStagedImage: (image: ImportedImage) => void;
  discardStagedImages: (ids: string[]) => void;
  importImages: (images: ImportedImage[]) => Promise<void>;

  // Imported library state and functions
  importedImages: ImportedImage[];
  updateImportedImage: (image: ImportedImage) => Promise<void>;
  deleteImportedImage: (id: string) => Promise<void>;
  loadImportedImages: () => Promise<void>;
}

export const ImageImporterContext = createContext<ImageImporterContextType | undefined>(undefined);

export const ImageImporterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stagedImages, setStagedImages] = useState<ImportedImage[]>([]);
  const [importedImages, setImportedImages] = useState<ImportedImage[]>([]);

  const loadImportedImages = useCallback(async () => {
    const dbImages = await getImportedImages();
    setImportedImages(dbImages);
  }, []);

  useEffect(() => {
    loadImportedImages();
  }, [loadImportedImages]);

  const addImagesToStaging = useCallback(async (imagesToAdd: Omit<ImportedImage, 'id' | 'tags' | 'category' | 'notes'>[]) => {
    const existingUrls = new Set([...stagedImages.map(i => i.srcUrl), ...importedImages.map(i => i.srcUrl)]);
    
    const newImages = imagesToAdd
      .filter(img => !existingUrls.has(img.srcUrl))
      .map(img => ({
        ...img,
        id: crypto.randomUUID(),
        tags: [],
        category: '',
        notes: '',
      }));

    if (newImages.length > 0) {
        setStagedImages(prev => [...prev, ...newImages]);
    }
  }, [stagedImages, importedImages]);

  const updateStagedImage = useCallback((image: ImportedImage) => {
    setStagedImages(prev => prev.map(img => (img.id === image.id ? image : img)));
  }, []);

  const discardStagedImages = useCallback((ids: string[]) => {
    setStagedImages(prev => prev.filter(img => !ids.includes(img.id)));
  }, []);
  
  const importImages = useCallback(async (imagesToImport: ImportedImage[]) => {
    for (const image of imagesToImport) {
        await saveImportedImage(image);
    }
    const importedIds = new Set(imagesToImport.map(i => i.id));
    setStagedImages(prev => prev.filter(img => !importedIds.has(img.id)));
    // Use functional update to ensure we have the latest state
    setImportedImages(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newImagesToAdd = imagesToImport.filter(i => !existingIds.has(i.id));
        return [...prev, ...newImagesToAdd];
    });
  }, []);

  const updateImportedImage = useCallback(async (image: ImportedImage) => {
    await saveImportedImage(image);
    setImportedImages(prev => prev.map(img => (img.id === image.id ? image : img)));
  }, []);

  const deleteImportedImage = useCallback(async (id: string) => {
    await dbDeleteImportedImage(id);
    setImportedImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const value = {
    stagedImages,
    addImagesToStaging,
    updateStagedImage,
    discardStagedImages,
    importImages,
    importedImages,
    updateImportedImage,
    deleteImportedImage,
    loadImportedImages
  };

  return (
    <ImageImporterContext.Provider value={value}>
      {children}
    </ImageImporterContext.Provider>
  );
};
```

---

## `contexts/ImporterContext.tsx`

```typescript
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ArticleContent } from '../types';
import { getArticleMetadata } from '../services/wikipediaService';

interface ImporterContextType {
  stagedArticles: ArticleContent[];
  addArticle: (article: { title: string, html: string }) => Promise<void>;
  removeArticle: (title: string) => void;
  clearImporter: () => void;
  isArticleStaged: (title: string) => boolean;
}

export const ImporterContext = createContext<ImporterContextType | undefined>(undefined);

export const ImporterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stagedArticles, setStagedArticles] = useState<ArticleContent[]>([]);

  const addArticle = useCallback(async (article: { title: string, html: string }) => {
    // Prevent duplicates
    if (stagedArticles.some(a => a.title === article.title)) {
        return;
    }
    const metadataArray = await getArticleMetadata([article.title]);
    const articleWithMeta: ArticleContent = { 
        ...article,
        metadata: metadataArray.length > 0 ? metadataArray[0] : undefined 
    };

    setStagedArticles(prev => [...prev, articleWithMeta]);
  }, [stagedArticles]);

  const removeArticle = useCallback((title: string) => {
    setStagedArticles(prev => prev.filter(a => a.title !== title));
  }, []);
  
  const clearImporter = useCallback(() => {
    setStagedArticles([]);
  }, []);

  const isArticleStaged = useCallback((title: string) => {
    return stagedArticles.some(a => a.title === title);
  }, [stagedArticles]);

  const value = {
    stagedArticles,
    addArticle,
    removeArticle,
    clearImporter,
    isArticleStaged
  };

  return (
    <ImporterContext.Provider value={value}>
      {children}
    </ImporterContext.Provider>
  );
};
```

---

## `contexts/ProjectsContext.tsx`

```typescript
import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '../types';
import { getProjects, saveProject, deleteProject as dbDeleteProject } from '../services/dbService';
import { useToasts } from '../hooks/useToasts';
import { useSettings } from '../hooks/useSettingsContext';

interface ProjectsContextType {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | undefined;
  setActiveProjectId: (id: string) => void;
  updateProject: (updatedProject: Project) => Promise<void>;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  addArticleToProject: (title: string) => void;
  createNewProject: (callback?: () => void) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  reloadProjects: () => void;
}

export const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const { settings } = useSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    let dbProjects = await getProjects();
    if (dbProjects.length === 0 && settings) {
      const newProject: Project = { 
        id: crypto.randomUUID(), 
        name: t('New Compilation'), 
        articles: [], 
        notes: '',
        lastActiveView: 'settings',
      };
      await saveProject(newProject);
      dbProjects = [newProject];
    }
    setProjects(dbProjects);
  }, [settings, t]);

  useEffect(() => {
    if (settings) {
        loadProjects();
    }
  }, [loadProjects, settings]);

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

  const updateProject = useCallback(async (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
    await saveProject(updatedProject);
  }, []);
  
  const renameProject = useCallback(async (projectId: string, newName: string) => {
    const projectToUpdate = projects.find(p => p.id === projectId);
    if (projectToUpdate) {
        const updatedProject = { ...projectToUpdate, name: newName };
        await updateProject(updatedProject);
    }
  }, [projects, updateProject]);

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
      updateProject(updatedProject);
    }
  }, [activeProject, updateProject]);

  const createNewProject = useCallback(async (callback?: () => void) => {
    if (!settings) return;

    const baseName = t('New Compilation');
    let newName = baseName;
    let counter = 2;
    while (projects.some(p => p.name === newName)) {
        newName = `${baseName} ${counter}`;
        counter++;
    }

    const newProject: Project = { 
        id: crypto.randomUUID(), 
        name: newName, 
        articles: [], 
        notes: '',
        lastActiveView: 'settings',
    };
    await saveProject(newProject);
    
    setProjects(prevProjects => [...prevProjects, newProject]);
    setActiveProjectId(newProject.id);
    if (callback) callback();
  }, [t, projects, settings]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (projects.length <= 1) {
        addToast(t('You cannot delete the last project.'), 'error');
        return;
    }
    if (window.confirm(t('Delete Project Confirmation'))) {
        await dbDeleteProject(projectId);
        const remainingProjects = projects.filter(p => p.id !== projectId);
        setProjects(remainingProjects);

        if (activeProjectId === projectId) {
            setActiveProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
        }
    }
  }, [projects, activeProjectId, t, addToast]);

  const value = {
    projects,
    activeProjectId,
    activeProject,
    setActiveProjectId,
    updateProject,
    renameProject,
    addArticleToProject,
    createNewProject,
    deleteProject,
    reloadProjects: loadProjects,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};
```

---

## `contexts/SettingsContext.tsx`

```typescript
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import i18next from '../i18n';
import { View, AppSettings } from '../types';
import { getSettings, saveSettings } from '../services/dbService';

const DEFAULT_SETTINGS: Omit<AppSettings, 'theme'> = {
  language: 'en',
  defaultView: View.Library,
  library: {
    searchResultLimit: 10,
    aiAssistant: {
      enabled: true,
      systemInstruction: '',
      focus: {
        summary: true,
        keyConcepts: true,
        researchQuestions: true,
      },
    },
  },
  citations: {
    customCitations: [],
    citationStyle: 'apa',
  }
};

interface SettingsContextType {
  settings: AppSettings | null;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  reloadSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Helper function to check if an item is a non-array object.
 */
const isObject = (item: any): item is Record<string, any> => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Deeply merges a source object into a target object.
 * This ensures that default settings are always present.
 */
const deepMerge = (target: any, source: any): any => {
  if (!isObject(target) || !isObject(source)) {
    return source !== undefined ? source : target;
  }

  const output = { ...target };

  for (const key in source) {
    if (isObject(source[key])) {
      if (!(key in target) || !isObject(target[key])) {
        Object.assign(output, { [key]: source[key] });
      } else {
        output[key] = deepMerge(target[key], source[key]);
      }
    } else if (source[key] !== undefined) {
      Object.assign(output, { [key]: source[key] });
    }
  }

  return output;
};


export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const loadInitialSettings = useCallback(async () => {
    const dbSettings = await getSettings();

    // Start with a fresh, deep copy of the defaults.
    const defaults = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    
    // Robustly merge the saved settings (if any) over the defaults.
    const mergedSettings: AppSettings = deepMerge(defaults, dbSettings || {});

    setSettings(mergedSettings);
    await saveSettings(mergedSettings);

    if (i18next.language !== mergedSettings.language) {
        i18next.changeLanguage(mergedSettings.language);
    }
  }, []);

  useEffect(() => {
    loadInitialSettings();
  }, [loadInitialSettings]);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (i18next.language !== newSettings.language) {
      await i18next.changeLanguage(newSettings.language);
    }
    await saveSettings(newSettings);
  }, []);

  const value = {
    settings,
    updateSettings,
    reloadSettings: loadInitialSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
```

---

## `contexts/ToastContext.tsx`

```typescript
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage, ToastType } from '../types';

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: number) => void;
}

// FIX: Initializing with an undefined value and checking for it in the consumer hook is safer
// and provides better type inference than an empty object.
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Using a callback with setToasts ensures we have the latest state and avoids dependency on `toasts` array.
  const addToast = useCallback((message: string, type: ToastType) => {
    const newToast: ToastMessage = {
      // Using a combination of timestamp and random number for a more robust unique ID.
      id: Date.now() + Math.random(),
      message,
      type,
    };
    setToasts(currentToasts => [...currentToasts, newToast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  const value = { toasts, addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
```

---

## `hooks/useArticleAnalysis.ts`

```typescript
import { useState, useCallback } from 'react';
import { ArticleContent, ArticleInsights } from '../types';
import { getArticleInsights } from '../services/geminiService';
import { useSettings } from './useSettingsContext';

// Memoize the element used for stripping HTML to avoid creating it on every call.
const textExtractor = document.createElement('div');

export const useArticleAnalysis = (
    article: ArticleContent | null
) => {
    const { settings } = useSettings();
    const [insights, setInsights] = useState<ArticleInsights | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const analyze = useCallback(async () => {
        if (!article || !settings || !settings.library.aiAssistant.enabled) return;

        setIsAnalyzing(true);
        setInsights(null);
        setAnalysisError(null);

        textExtractor.innerHTML = article.html;
        const textContent = textExtractor.textContent || textExtractor.innerText || "";

        try {
            const resultInsights = await getArticleInsights(
                textContent, 
                settings.library.aiAssistant.systemInstruction,
                settings.library.aiAssistant.focus
            );
            setInsights(resultInsights);
        } catch (error) {
            console.error("Analysis failed:", error);
            setAnalysisError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsAnalyzing(false);
        }
    }, [article, settings]);

    const clearAnalysis = useCallback(() => {
        setInsights(null);
        setAnalysisError(null);
        setIsAnalyzing(false);
    }, []);

    return {
        insights,
        isAnalyzing,
        analysisError,
        analyze,
        clearAnalysis,
    };
};
```

---

## `hooks/useClickOutside.ts`

```typescript
import { useEffect, RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
```

---

## `hooks/useDarkMode.ts`

```typescript
import { useEffect } from 'react';

export const useDarkMode = (): void => {
    useEffect(() => {
        const root = window.document.documentElement;
        // Always apply dark mode and remove light mode if it exists.
        root.classList.remove('light');
        root.classList.add('dark');
    }, []);
};
```

---

## `hooks/useDebounce.ts`

```typescript

import { useState, useEffect } from 'react';

export function useDebounce<T,>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## `hooks/useFocusTrap.ts`

```typescript
import { useEffect, useRef, RefObject } from 'react';

/**
 * Custom hook to trap focus within a component (e.g., a modal).
 * @param isOpen - Boolean to indicate if the trap is active.
 * @returns A ref to attach to the trapping element.
 */
export const useFocusTrap = <T extends HTMLElement>(isOpen: boolean): RefObject<T> => {
  const ref = useRef<T>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !ref.current) {
      return;
    }

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const focusableElements = ref.current.querySelectorAll<HTMLElement>(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }

      if (e.shiftKey) { // Shift+Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen]);

  return ref;
};
```

---

## `hooks/useImageImporterContext.ts`

```typescript
import { useContext } from 'react';
import { ImageImporterContext } from '../contexts/ImageImporterContext';

export const useImageImporter = () => {
  const context = useContext(ImageImporterContext);
  if (context === undefined) {
    throw new Error('useImageImporter must be used within an ImageImporterProvider');
  }
  return context;
};
```

---

## `hooks/useImporterContext.ts`

```typescript
import { useContext } from 'react';
import { ImporterContext } from '../contexts/ImporterContext';

export const useImporter = () => {
  const context = useContext(ImporterContext);
  if (context === undefined) {
    throw new Error('useImporter must be used within an ImporterProvider');
  }
  return context;
};
```

---

## `hooks/useProjectsContext.ts`

```typescript
import { useContext } from 'react';
import { ProjectsContext } from '../contexts/ProjectsContext';

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};
```

---

## `hooks/useSettingsContext.ts`

```typescript
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
```

---

## `hooks/useToasts.ts`

```typescript
import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
};
```