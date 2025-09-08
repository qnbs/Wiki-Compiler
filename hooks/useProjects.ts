import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, View } from '../types';
import { getProjects, saveProject, deleteProject as dbDeleteProject } from '../services/dbService';

export const useProjects = (setView: (view: View) => void) => {
    const { t } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        let dbProjects = await getProjects();
        if (dbProjects.length === 0) {
            const newProject: Project = { id: crypto.randomUUID(), name: 'My First Compilation', articles: [], notes: '' };
            await saveProject(newProject);
            dbProjects = [newProject];
        }
        setProjects(dbProjects);
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

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

    const updateActiveProject = useCallback(async (updatedProject: Project) => {
        setProjects(prevProjects =>
            prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
        );
        await saveProject(updatedProject);
    }, []);

    const createNewProject = useCallback(async () => {
        const baseName = t('New Compilation');
        let newName = baseName;
        let counter = 2;
        while (projects.some(p => p.name === newName)) {
            newName = `${baseName} ${counter}`;
            counter++;
        }

        const newProject: Project = { id: crypto.randomUUID(), name: newName, articles: [], notes: '' };
        await saveProject(newProject);
        
        setProjects(prevProjects => [...prevProjects, newProject]);
        setActiveProjectId(newProject.id);
        setView(View.Compiler);
    }, [t, setView, projects]);

    const deleteProject = useCallback(async (projectId: string) => {
        if (projects.length <= 1) {
            alert(t('You cannot delete the last project.'));
            return;
        }
        if (window.confirm(t('Delete Project Confirmation'))) {
            await dbDeleteProject(projectId);
            setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
        }
    }, [projects, t]);
    
    return {
        projects,
        activeProjectId,
        activeProject,
        setActiveProjectId,
        updateActiveProject,
        createNewProject,
        deleteProject,
        loadProjects,
    };
};