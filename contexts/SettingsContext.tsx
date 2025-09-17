import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import i18next from '../i18n';
import { View, AppSettings } from '../types';
import { getSettings, saveSettings } from '../services/dbService';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  defaultView: View.Library,
  theme: 'system',
  accentColor: 'blue',
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
  reloadSettings: () => Promise<void>;
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
  // Ensure all default keys are present in the final object
  for (const key in target) {
      if(!(key in output)) {
          output[key] = target[key];
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