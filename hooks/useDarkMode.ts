import { useState, useEffect } from 'react';
import { Theme } from '../types';

export const useDarkMode = (theme: Theme | undefined): [boolean] => {
    const effectiveTheme = theme || 'system';

    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (effectiveTheme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return effectiveTheme === 'dark';
    });

    useEffect(() => {
        if (effectiveTheme === 'system') {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        } else {
            setIsDarkMode(effectiveTheme === 'dark');
        }
    }, [effectiveTheme]);

    useEffect(() => {
        if (effectiveTheme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setIsDarkMode(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [effectiveTheme]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    return [isDarkMode];
};
