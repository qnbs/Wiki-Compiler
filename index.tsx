import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18next from './i18n';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { ToastProvider } from './contexts/ToastContext';
import { ImporterProvider } from './contexts/ImporterContext';
import { ImageImporterProvider } from './contexts/ImageImporterContext';
import { ArticleCacheProvider } from './contexts/ArticleCacheContext';

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(I18nextProvider, { i18n: i18next },
      React.createElement(ToastProvider, null,
        React.createElement(SettingsProvider, null,
          React.createElement(ProjectsProvider, null,
            React.createElement(ImporterProvider, null,
              React.createElement(ImageImporterProvider, null,
                React.createElement(ArticleCacheProvider, null,
                  React.createElement(App, null)
                )
              )
            )
          )
        )
      )
    )
  )
);
