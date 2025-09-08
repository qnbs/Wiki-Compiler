import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18next from './i18n';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { ToastProvider } from './contexts/ToastContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <ToastProvider>
        <SettingsProvider>
          <ProjectsProvider>
            <App />
          </ProjectsProvider>
        </SettingsProvider>
      </ToastProvider>
    </I18nextProvider>
  </React.StrictMode>
);