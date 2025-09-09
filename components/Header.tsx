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
  const { images: importedImages } = useImageImporter();
  
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
    { id: View.ImageImporter, icon: 'palette', label: 'Image Importer', badge: importedImages.length > 0 ? importedImages.length : undefined },
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
              badge={importedImages.length > 0 ? importedImages.length : undefined}
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