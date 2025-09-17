# Wiki Compiler: Quellcode-Dokumentation (Teil 5: UI- und Unterkomponenten)

Dieses Dokument enthält den Quellcode für alle wiederverwendbaren UI-Komponenten, spezialisierten Unterkomponenten (wie den Editor und die Einstellungs-Tabs) und Hilfskomponenten.

---

## `components/Header.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import Icon from './Icon';
import { useClickOutside } from '../hooks/useClickOutside';
import { useProjects } from '../hooks/useProjectsContext';
import { useImporter } from '../hooks/useImporterContext';
import { useImageImporter } from '../hooks/useImageImporterContext';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
  openCommandPalette: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, setView, openCommandPalette }) => {
  const { t } = useTranslation();
  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createNewProject,
    deleteProject,
    renameProject,
  } = useProjects();
  const { stagedArticles } = useImporter();
  const { stagedImages } = useImageImporter();
  
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMoreNavOpen, setIsMoreNavOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreNavRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(projectDropdownRef, () => {
    if (editingProjectId) handleRenameSubmit();
    setIsProjectDropdownOpen(false)
  });
  useClickOutside(moreMenuRef, () => setIsMoreMenuOpen(false));
  useClickOutside(moreNavRef, () => setIsMoreNavOpen(false));


  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  useEffect(() => {
    if (editingProjectId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingProjectId]);
  
  useEffect(() => {
    if (!isProjectDropdownOpen) {
      setHighlightedIndex(0);
      setProjectSearch('');
    }
  }, [isProjectDropdownOpen]);

  const closeAllMenus = () => {
    if (editingProjectId) handleRenameSubmit();
    setIsProjectDropdownOpen(false);
    setIsMoreMenuOpen(false);
    setIsMoreNavOpen(false);
    setProjectSearch('');
  };

  const handleRenameClick = (project: (typeof projects)[0]) => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
  };

  const handleRenameSubmit = () => {
    if (editingProjectId && editingProjectName.trim()) {
      renameProject(editingProjectId, editingProjectName.trim());
    }
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const handleCreateNewProject = () => {
    createNewProject(() => setView(View.Compiler));
    closeAllMenus();
  }

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % filteredProjects.length);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + filteredProjects.length) % filteredProjects.length);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedProject = filteredProjects[highlightedIndex];
        if (selectedProject) {
            setActiveProjectId(selectedProject.id);
            closeAllMenus();
        }
    } else if (e.key === 'Escape') {
        closeAllMenus();
    }
  };

  const mainNavItems = [
    { id: View.Library, icon: 'book', label: 'Library', badge: undefined },
    { id: View.Archive, icon: 'archive-box', label: 'Archive', badge: undefined },
    { id: View.Compiler, icon: 'compiler', label: 'Compiler', badge: undefined },
    { id: View.Importer, icon: 'upload', label: 'Importer', badge: stagedArticles.length > 0 ? stagedArticles.length : undefined },
    { id: View.ImageImporter, icon: 'palette', label: 'Image Importer', badge: stagedImages.length > 0 ? stagedImages.length : undefined },
  ];

  const projectDropdownContent = (
    <div onKeyDown={handleDropdownKeyDown}>
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder={t('Search projects...')}
          value={projectSearch}
          onChange={(e) => {
            setProjectSearch(e.target.value);
            setHighlightedIndex(0);
          }}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900/50 focus:ring-1 focus:ring-accent-500 outline-none"
        />
      </div>
      <ul className="py-1 max-h-60 overflow-y-auto">
        {filteredProjects.map((project, index) => (
          <li 
            key={project.id} 
            onMouseMove={() => setHighlightedIndex(index)}
          >
            <div
               className={`flex justify-between items-center px-3 py-2 text-sm ${
                 index === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700/60' : ''
               } ${project.id === activeProjectId ? 'text-accent-600 dark:text-accent-400' : 'text-gray-700 dark:text-gray-300'}`}
            >
              {editingProjectId === project.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingProjectName}
                  onChange={(e) => setEditingProjectName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit();
                    if (e.key === 'Escape') setEditingProjectId(null);
                  }}
                  className="w-full bg-transparent outline-none ring-1 ring-accent-500 rounded px-1 -ml-1"
                />
              ) : (
                <>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveProjectId(project.id); closeAllMenus(); }} className="flex-grow flex items-center gap-2 truncate">
                    {project.id === activeProjectId && <Icon name="check" className="w-4 h-4 text-accent-500" />}
                    <span className="truncate pr-2">{project.name}</span>
                  </a>
                  <div className="flex items-center">
                    <button 
                      onClick={() => handleRenameClick(project)} 
                      className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-200"
                      aria-label={`Rename ${project.name}`}
                    >
                      <Icon name="pencil" className="w-4 h-4" />
                    </button>
                    {projects.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }} 
                        className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500"
                        aria-label={`Delete ${project.name}`}
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        <button onClick={handleCreateNewProject} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-md">
          <Icon name="plus" className="w-4 h-4" />
          {t('Create New Project')}
        </button>
      </div>
    </div>
  );

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('Wiki Compiler')}</h1>
        </div>
        
        {/* Center Navigation */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {/* Always Visible Items */}
          <NavButton icon="book" label={t('Library')} isActive={view === View.Library} onClick={() => setView(View.Library)} />
          <NavButton icon="compiler" label={t('Compiler')} isActive={view === View.Compiler} onClick={() => setView(View.Compiler)} />
          
          {/* Items visible on large screens */}
          <div className="hidden lg:flex items-center gap-2">
            <NavButton icon="archive-box" label={t('Archive')} isActive={view === View.Archive} onClick={() => setView(View.Archive)} />
            <NavButton 
              icon="upload" 
              label={t('Importer')} 
              isActive={view === View.Importer} 
              onClick={() => setView(View.Importer)} 
              badge={stagedArticles.length > 0 ? stagedArticles.length : undefined}
            />
            <NavButton 
              icon="palette" 
              label={t('Image Importer')} 
              isActive={view === View.ImageImporter} 
              onClick={() => setView(View.ImageImporter)} 
              badge={stagedImages.length > 0 ? stagedImages.length : undefined}
            />
          </div>

          {/* "More" dropdown for medium screens */}
          <div className="relative lg:hidden" ref={moreNavRef}>
            <button
                onClick={() => setIsMoreNavOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50"
            >
                {t('More')}
                <Icon name="chevron-down" className="w-4 h-4" />
            </button>
            {isMoreNavOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 lg:left-auto lg:right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-30 py-1">
                    <ul>
                        <MenuItem icon="archive-box" label={t('Archive')} onClick={() => { setView(View.Archive); closeAllMenus(); }} />
                        <MenuItem icon="upload" label={t('Importer')} onClick={() => { setView(View.Importer); closeAllMenus(); }} />
                        <MenuItem icon="palette" label={t('Image Importer')} onClick={() => { setView(View.ImageImporter); closeAllMenus(); }} />
                    </ul>
                </div>
            )}
          </div>
        </div>


        <div className="flex items-center gap-2">
          {/* Project Selector */}
          <div className="relative" ref={projectDropdownRef}>
            <button
              onClick={() => { setIsProjectDropdownOpen(prev => !prev); setIsMoreMenuOpen(false); }}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px] sm:max-w-none">{activeProject?.name}</span>
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
    badge?: number;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-white dark:bg-gray-700 text-accent-600 dark:text-accent-300 shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon name={icon} className="w-4 h-4" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white">
          {badge}
        </span>
      )}
    </button>
)

export default Header;
```

---

## `components/BottomNavBar.tsx`

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from '../types';
import Icon from './Icon';
import { useImporter } from '../hooks/useImporterContext';

interface BottomNavBarProps {
  view: View;
  setView: (view: View) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ view, setView }) => {
  const { t } = useTranslation();
  const { stagedArticles } = useImporter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around p-1 sm:hidden z-30">
      <NavButton icon="book" label={t('Library')} isActive={view === View.Library} onClick={() => setView(View.Library)} />
      <NavButton icon="archive-box" label={t('Archive')} isActive={view === View.Archive} onClick={() => setView(View.Archive)} />
      <NavButton icon="compiler" label={t('Compiler')} isActive={view === View.Compiler} onClick={() => setView(View.Compiler)} />
      <NavButton 
        icon="upload" 
        label={t('Importer')} 
        isActive={view === View.Importer} 
        onClick={() => setView(View.Importer)}
        badge={stagedArticles.length > 0 ? stagedArticles.length : undefined}
        />
      <NavButton icon="palette" label={t('Image Importer')} isActive={view === View.ImageImporter} onClick={() => setView(View.ImageImporter)} />
    </nav>
  );
};

interface NavButtonProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
    badge?: number;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-16 rounded-lg transition-colors ${
        isActive
          ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon name={icon} className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
       {badge && (
        <span className="absolute top-1 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900">
          {badge}
        </span>
      )}
    </button>
);

export default BottomNavBar;
```

---

## `components/Icon.tsx`

```typescript
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  title?: string;
}

// Storing path data as strings instead of JSX elements for robustness.
// This prevents potential JSX parsing errors that can crash the app on load.
const icons: { [key:string]: string } = {
    search: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
    book: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.105 0 4.078.713 5.5 1.971m5.5 0A8.987 8.987 0 0 0 18 18c-2.105 0-4.078.713-5.5 1.971m5.5 0V3.75c-1.052 0-2.062.18-3 .512A8.967 8.967 0 0 0 12 6.042m0 0v11.928m0-11.928L12 6.042Z",
    plus: "M12 4.5v15m7.5-7.5h-15",
    sun: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 12a2.25 2.25 0 0 1-2.25-2.25V7.5a2.25 2.25 0 0 1 4.5 0v2.25A2.25 2.25 0 0 1 12 12Z",
    moon: "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 2.138 0 4.125-.683 5.752-1.848Z",
    compiler: "M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9",
    trash: "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 0 0-2.09 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
    grip: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
    arrow: "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3",
    'arrow-left': "M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18",
    'arrow-up': "M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18",
    'arrow-down': "M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3",
    sparkles: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z",
    download: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3",
    link: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244",
    document: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    'chevron-down': "m19.5 8.25-7.5 7.5-7.5-7.5",
    settings: "M10.343 3.94c.09-.542.56-1.003 1.11-1.226M10.343 3.94a3.75 3.75 0 0 1-3.253.906m3.253-.906a3.75 3.75 0 0 0 3.253.906m-6.506 0a3.75 3.75 0 0 0-3.253-.906m3.253.906 3.253.906m6.08 4.992a3.75 3.75 0 0 1 .906 3.253m-.906-3.253a3.75 3.75 0 0 0 .906 3.253m-.906-3.253a3.75 3.75 0 0 1-.906 3.253m0-6.506a3.75 3.75 0 0 1-.906-3.253m.906 3.253a3.75 3.75 0 0 0-.906-3.253m9.247 11.25a3.75 3.75 0 0 1-3.253-.906m3.253.906a3.75 3.75 0 0 0-3.253-.906m-6.506 0a3.75 3.75 0 0 0 3.253.906m-3.253-.906a3.75 3.75 0 0 1 3.253.906m0 6.506a3.75 3.75 0 0 1 3.253.906M13.657 20.06a3.75 3.75 0 0 1-3.253.906m3.253-.906a3.75 3.75 0 0 0-3.253-.906m-6.506 0a3.75 3.75 0 0 0 3.253.906m-3.253-.906a3.75 3.75 0 0 1 3.253.906M12 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z",
    help: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
    command: "M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5",
    'archive-box': "m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.75 7.5h16.5v-1.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v1.5Z",
    beaker: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v.214a2.25 2.25 0 0 1-1.125 1.949l-5.406 2.704a2.25 2.25 0 0 1-2.25 0l-5.406-2.704A2.25 2.25 0 0 1 5 14.714v-.214M19 14.5a2.25 2.25 0 0 0-2.25-2.25h-5.25a2.25 2.25 0 0 0-2.25 2.25M5 14.5a2.25 2.25 0 0 1 2.25-2.25h5.25a2.25 2.25 0 0 1 2.25 2.25m0 0H5",
    key: "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z",
    desktop: "M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z",
    palette: "m15.75 10.5 4.72-4.72a.75.75 0 0 0-1.06-1.06L15 9.19l-2.12-2.12a.75.75 0 0 0-1.06 0L9.75 9.19l-4.72-4.72a.75.75 0 0 0-1.06 1.06L8.25 10.5l-4.03 4.03a.75.75 0 1 0 1.06 1.06L9 12.81l2.12 2.12a.75.75 0 0 0 1.06 0l2.12-2.12 3.53 3.53a.75.75 0 0 0 1.06-1.06l-4.03-4.03Z M12.75 15 12 14.25 11.25 15 12 15.75 12.75 15Z",
    upload: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5",
    info: "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z",
    'dots-vertical': "M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z",
    check: "M4.5 12.75l6 6 9-13.5",
    'x-mark': "M6 18 18 6M6 6l12 12",
    pencil: "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6', title }) => {
  const pathData = icons[name];
  
  if (!pathData) {
    // Return a fallback or null if icon name is invalid to prevent crashes
    return null;
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d={pathData} />
    </svg>
  );
};

export default Icon;
```

---

## `components/Modal.tsx`

```typescript
import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
}) => {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all w-full ${sizeClasses[size]} animate-pop-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close modal"
          >
            <Icon name="x-mark" className="w-5 h-5" />
          </button>
        </header>
        <main className="p-6">
          {children}
        </main>
        {actions && (
          <footer className="flex justify-end items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            {actions}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
```

---

## `components/SlideOverPanel.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap';
import Icon from './Icon';

interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SlideOverPanel: React.FC<SlideOverPanelProps> = ({ isOpen, onClose, title, children }) => {
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  const handleTransitionEnd = () => {
      if (!isOpen) {
          setIsRendered(false);
      }
  };

  if (!isRendered) return null;

  const panelClasses = isOpen
    ? 'translate-x-0'
    : 'translate-x-full';
  
  const overlayClasses = isOpen
    ? 'opacity-100'
    : 'opacity-0';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slide-over-title"
      className="fixed inset-0 overflow-hidden z-40"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Background overlay */}
        <div
          onClick={onClose}
          className={`slide-over-overlay absolute inset-0 bg-gray-900 bg-opacity-75 ${overlayClasses}`}
          aria-hidden="true"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <div
            ref={panelRef}
            onTransitionEnd={handleTransitionEnd}
            className={`slide-over-panel w-screen max-w-4xl ${panelClasses}`}
          >
            <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 shadow-xl">
              <header className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <h2 id="slide-over-title" className="text-xl font-semibold text-gray-900 dark:text-white truncate pr-4">
                  {title}
                </h2>
                <button
                  type="button"
                  className="rounded-md p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <Icon name="x-mark" className="h-6 w-6" />
                </button>
              </header>
              <div className="relative flex-1">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SlideOverPanel;
```

---

## `components/Toast.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import Icon from './Icon';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const toastConfig = {
  success: {
    icon: 'check',
    bg: 'bg-green-50 dark:bg-green-900/40',
    border: 'border-green-400 dark:border-green-600',
    iconColor: 'text-green-500',
  },
  error: {
    icon: 'x-mark',
    bg: 'bg-red-50 dark:bg-red-900/40',
    border: 'border-red-400 dark:border-red-600',
    iconColor: 'text-red-500',
  },
  info: {
    icon: 'info',
    bg: 'bg-blue-50 dark:bg-blue-900/40',
    border: 'border-blue-400 dark:border-blue-600',
    iconColor: 'text-blue-500',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const config = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);
  
  const handleDismiss = () => {
     setIsExiting(true);
     setTimeout(() => onDismiss(toast.id), 300);
  }

  return (
    <div
      className={`w-full max-w-sm rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${config.bg} ${config.border} transition-all duration-300 ease-in-out ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon name={config.icon} className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <Icon name="x-mark" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
```

---

## `components/ToastContainer.tsx`

```typescript
import React from 'react';
import { useToasts } from '../hooks/useToasts';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToasts();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
```

---

## `components/Spinner.tsx`

```typescript

import React from 'react';

interface SpinnerProps {
  light?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ light = false }) => {
  const borderColor = light ? 'border-gray-100' : 'border-gray-700 dark:border-gray-300';
  const borderTopColor = light ? 'border-t-white' : 'border-t-blue-500 dark:border-t-blue-400';

  return (
    <div className={`w-5 h-5 border-2 ${borderColor} ${borderTopColor} border-solid rounded-full animate-spin`}></div>
  );
};

export default Spinner;
```

---

## `components/SkeletonLoader.tsx`

```typescript
import React from 'react';

const SkeletonLoader: React.FC = () => {
    return (
        <div className="w-full animate-pulse space-y-6 p-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-4/6"></div>
                 <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            </div>
        </div>
    );
};

export default SkeletonLoader;
```

---

## `components/WelcomeModal.tsx`

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Icon from './Icon';
import { useSettings } from '../hooks/useSettingsContext';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageButton: React.FC<{lang: string, currentLang: string, onClick: (lang: string) => void, children: React.ReactNode}> = ({ lang, currentLang, onClick, children }) => (
    <button 
        onClick={() => onClick(lang)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
            currentLang === lang 
            ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300 ring-2 ring-accent-500' 
            : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
    >
        {children}
    </button>
);

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();

  const handleGetStarted = () => {
    localStorage.setItem('wiki-compiler-onboarded', 'true');
    onClose();
  };
  
  const handleLanguageChange = (lang: string) => {
    if (settings) {
        i18n.changeLanguage(lang);
        updateSettings({ ...settings, language: lang });
    }
  };

  const sections = [
    {
      title: 'welcome_library_title',
      icon: 'book',
      content: 'welcome_library_p',
    },
    {
      title: 'welcome_compiler_title',
      icon: 'compiler',
      content: 'welcome_compiler_p',
    },
    {
      title: 'welcome_archive_title',
      icon: 'archive-box',
      content: 'welcome_archive_p',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleGetStarted}
      title={t('Welcome to Wiki Compiler')}
      actions={
        <button onClick={handleGetStarted} className="px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700">
          {t('Get Started')}
        </button>
      }
    >
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-300">
          {t('welcome_p1')}
        </p>

        <div className="flex justify-center items-center gap-4 py-2">
