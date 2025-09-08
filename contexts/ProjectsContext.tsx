import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '../types';
import { getProjects, saveProject, deleteProject as dbDeleteProject } from '../services/dbService';
import { useToasts } from '../hooks/useToasts';
import { useSettings } from '../hooks/useSettingsContext';

interface ProjectsContextType {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | undefined;
  setActiveProjectId: (id: string) => void;
  updateProject: (updatedProject: Project) => Promise<void>;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  addArticleToProject: (title: string) => void;
  createNewProject: (callback?: () => void) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  reloadProjects: () => void;
}

export const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const { settings } = useSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    let dbProjects = await getProjects();
    if (dbProjects.length === 0 && settings) {
      const newProject: Project = { 
        id: crypto.randomUUID(), 
        name: t('New Compilation'), 
        articles: [], 
        notes: '',
        lastActiveView: 'settings',
      };
      await saveProject(newProject);
      dbProjects = [newProject];
    }
    setProjects(dbProjects);
  }, [settings, t]);

  useEffect(() => {
    if (settings) {
        loadProjects();
    }
  }, [loadProjects, settings]);

  useEffect(() => {
    if (projects.length > 0) {
      const activeProjectExists = projects.some(p => p.id === activeProjectId);
      if (!activeProjectId || !activeProjectExists) {
        setActiveProjectId(projects[0].id);
      }
    }
  }, [projects, activeProjectId]);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId)
  , [projects, activeProjectId]);

  const updateProject = useCallback(async (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
    await saveProject(updatedProject);
  }, []);
  
  const renameProject = useCallback(async (projectId: string, newName: string) => {
    const projectToUpdate = projects.find(p => p.id === projectId);
    if (projectToUpdate) {
        const updatedProject = { ...projectToUpdate, name: newName };
        await updateProject(updatedProject);
    }
  }, [projects, updateProject]);

  const addArticleToProject = useCallback((title: string) => {
    if (activeProject) {
      if (activeProject.articles.some(a => a.title === title)) {
        return;
      }
      const newArticle = { title };
      const updatedProject = {
        ...activeProject,
        articles: [...activeProject.articles, newArticle],
      };
      updateProject(updatedProject);
    }
  }, [activeProject, updateProject]);

  const createNewProject = useCallback(async (callback?: () => void) => {
    if (!settings) return;

    const baseName = t('New Compilation');
    let newName = baseName;
    let counter = 2;
    while (projects.some(p => p.name === newName)) {
        newName = `${baseName} ${counter}`;
        counter++;
    }

    const newProject: Project = { 
        id: crypto.randomUUID(), 
        name: newName, 
        articles: [], 
        notes: '',
        lastActiveView: 'settings',
    };
    await saveProject(newProject);
    
    setProjects(prevProjects => [...prevProjects, newProject]);
    setActiveProjectId(newProject.id);
    if (callback) callback();
  }, [t, projects, settings]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (projects.length <= 1) {
        addToast(t('You cannot delete the last project.'), 'error');
        return;
    }
    if (window.confirm(t('Delete Project Confirmation'))) {
        await dbDeleteProject(projectId);
        const remainingProjects = projects.filter(p => p.id !== projectId);
        setProjects(remainingProjects);

        if (activeProjectId === projectId) {
            setActiveProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
        }
    }
  }, [projects, activeProjectId, t, addToast]);

  const value = {
    projects,
    activeProjectId,
    activeProject,
    setActiveProjectId,
    updateProject,
    renameProject,
    addArticleToProject,
    createNewProject,
    deleteProject,
    reloadProjects: loadProjects,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};