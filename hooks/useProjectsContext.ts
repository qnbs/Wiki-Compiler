import { useContext } from 'react';
import { ProjectsContext } from '../contexts/ProjectsContext';

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};
