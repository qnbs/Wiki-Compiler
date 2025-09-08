import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import i18next from '../i18n';
import { View, AppSettings, AccentColor } from '../types';
import { getSettings, saveSettings } from '../services/dbService';

const DEFAULT_SETTINGS: Omit<AppSettings, 'theme'> = {
  language: 'en',
  accentColor: 'blue',
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

const accentColorMap: Record<AccentColor, Record<string, string>> = {
  blue: { '50': '239 246 255', '100': '219 234 254', '200': '191 219 254', '300': '147 197 253', '400': '96 165 250', '500': '59 130 246', '600': '37 99 235', '700': '29 78 216', '800': '30 64 175', '900': '30 58 138' },
  purple: { '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253', '400': '167 139 250', '500': '139 92 246', '600': '124 58 237', '700': '109 40 217', '800': '91 33 182', '900': '76 29 149' },
  green: { '50': '240 253 244', '100': '220 252 231', '200': '187 247 208', '300': '134 239 172', '400': '74 222 128', '500': '34 197 94', '600': '22 163 74', '700': '21 128 61', '800': '22 101 52', '900': '20 83 45' },
  orange: { '50': '255 247 237', '100': '255 237 213', '200': '254 215 170', '300': '253 186 116', '400': '251 146 60', '500': '249 115 22', '600': '234 88 12', '700': '194 65 12', '800': '154 52 18', '900': '124 45 18' }
};


interface SettingsContextType {
  settings: AppSettings | null;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  reloadSettings: () => void;
  accentColorMap: Record<AccentColor, Record<string, string>>;
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
    accentColorMap,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};