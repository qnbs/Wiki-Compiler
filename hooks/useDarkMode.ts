import { useEffect } from 'react';

// This hook ensures the dark theme is applied on app load,
// aligning with the app's hardcoded dark mode.
export const useDarkMode = (): void => {
    useEffect(() => {
        const root = window.document.documentElement;
        if (!root.classList.contains('dark')) {
            root.classList.add('dark');
        }
        // No cleanup needed as it should always be dark.
    }, []); // Run only once on mount
};
