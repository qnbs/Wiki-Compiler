import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Project } from '../types';
import Icon from './Icon';
import { useClickOutside } from '../hooks/useClickOutside';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  projectName: string;
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  createNewProject: () => void;
  deleteProject: (id: string) => void;
  openCommandPalette: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  view, setView, isDarkMode, toggleDarkMode, projectName,
  projects, activeProjectId, setActiveProjectId, createNewProject, deleteProject,
  openCommandPalette
}) => {
  const { t } = useTranslation();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(projectDropdownRef, () => setIsProjectDropdownOpen(false));
  useClickOutside(moreMenuRef, () => setIsMoreMenuOpen(false));

  const closeAllMenus = () => {
    setIsProjectDropdownOpen(false);
    setIsMoreMenuOpen(false);
  };

  const projectDropdownContent = (
    <>
      <div className="p-2 font-semibold text-sm border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">{t('Projects')}</div>
      <ul className="py-1 max-h-60 overflow-y-auto">
        {projects.map(project => (
          <li key={project.id}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveProjectId(project.id); closeAllMenus(); }}
               className={`flex justify-between items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/60 ${project.id === activeProjectId ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <span className="truncate pr-2">{project.name}</span>
              {projects.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }} 
                  className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500"
                  aria-label={`Delete ${project.name}`}
                 >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              )}
            </a>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        <button onClick={() => { createNewProject(); closeAllMenus(); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-md">
          <Icon name="plus" className="w-4 h-4" />
          {t('Create New Project')}
        </button>
      </div>
    </>
  );

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('Wiki Compiler')}</h1>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <NavButton icon="book" label={t('Library')} isActive={view === View.Library} onClick={() => setView(View.Library)} />
          <NavButton icon="archive-box" label={t('Archive')} isActive={view === View.Archive} onClick={() => setView(View.Archive)} />
          <NavButton icon="compiler" label={t('Compiler')} isActive={view === View.Compiler} onClick={() => setView(View.Compiler)} />
        </div>

        <div className="flex items-center gap-2">
          {/* Project Selector */}
          <div className="relative" ref={projectDropdownRef}>
            <button
              onClick={() => { setIsProjectDropdownOpen(prev => !prev); setIsMoreMenuOpen(false); }}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px] sm:max-w-none">{projectName}</span>
              <Icon name="chevron-down" className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
            </button>
            {isProjectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-30">
                {projectDropdownContent}
              </div>
            )}
          </div>
          
          {/* Desktop Icons */}
          <div className="hidden sm:flex items-center gap-0">
            <IconButton onClick={openCommandPalette} icon="command" label={t('Open command palette')} />
            <IconButton onClick={() => setView(View.Help)} icon="help" label={t('Help')} />
            <IconButton onClick={() => setView(View.Settings)} icon="settings" label={t('Settings')} />
            <IconButton onClick={toggleDarkMode} icon={isDarkMode ? 'sun' : 'moon'} label={t('Toggle dark mode')} />
          </div>

          {/* Mobile "More" Menu */}
          <div className="sm:hidden relative" ref={moreMenuRef}>
            <IconButton onClick={() => { setIsMoreMenuOpen(prev => !prev); setIsProjectDropdownOpen(false); }} icon="dots-vertical" label={t('More options')} />
            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-30 py-1">
                <ul>
                  <MenuItem icon="command" label={t('Open command palette')} onClick={() => { openCommandPalette(); closeAllMenus(); }} />
                  <MenuItem icon="help" label={t('Help')} onClick={() => { setView(View.Help); closeAllMenus(); }} />
                  <MenuItem icon="settings" label={t('Settings')} onClick={() => { setView(View.Settings); closeAllMenus(); }} />
                  <MenuItem icon={isDarkMode ? 'sun' : 'moon'} label={t('Toggle dark mode')} onClick={() => { toggleDarkMode(); closeAllMenus(); }} />
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const IconButton: React.FC<{onClick: () => void; icon: string; label: string}> = ({ onClick, icon, label }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={label}
    >
        <Icon name={icon} className="w-5 h-5" />
    </button>
);

const MenuItem: React.FC<{onClick: () => void; icon: string; label: string}> = ({ onClick, icon, label }) => (
  <li>
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60">
      <Icon name={icon} className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <span>{label}</span>
    </button>
  </li>
);

interface NavButtonProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon name={icon} className="w-4 h-4" />
      {label}
    </button>
)

export default Header;