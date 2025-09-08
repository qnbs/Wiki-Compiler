import { useEffect } from 'react';

export const useDarkMode = (): void => {
    useEffect(() => {
        const root = window.document.documentElement;
        // Always apply dark mode and remove light mode if it exists.
        root.classList.remove('light');
        root.classList.add('dark');
    }, []);
};