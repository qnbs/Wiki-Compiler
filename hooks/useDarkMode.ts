import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../types';

export const useDarkMode = (): [Theme, (theme: Theme) => void, boolean] => {
    // State for the user's selected theme setting ('light', 'dark', 'system')
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'system';
        return (localStorage.getItem('theme') as Theme) || 'system';
    });
    
    // State for the current effective dark mode status
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return theme === 'dark';
    });

    // Update isDarkMode when theme setting changes
    useEffect(() => {
        if (theme === 'system') {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        } else {
            setIsDarkMode(theme === 'dark');
        }
    }, [theme]);

    // Listen for system preference changes when theme is 'system'
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setIsDarkMode(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Apply the 'dark' class to the document root
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Function to update the theme setting and persist it
    const handleSetTheme = useCallback((newTheme: Theme) => {
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
    }, []);

    return [theme, handleSetTheme, isDarkMode];
};
