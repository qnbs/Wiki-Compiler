import React, { useState, useEffect, useCallback } from 'react';
import { useProjects } from '../hooks/useProjectsContext';
import { useSettings } from '../hooks/useSettingsContext';
import { useToasts } from '../hooks/useToasts';
import { generatePdf, generateMarkdown, generateJsonFile, generateDocx } from '../services/exportService';
import Spinner from './Spinner';
import CompilerLeftPanel from './CompilerLeftPanel';
import CompilerRightPanel from './CompilerRightPanel';

interface CompilerViewProps {
  getArticleContent: (title: string) => Promise<string>;
}

export type RightPaneView = 'settings' | 'article' | 'markdown';

const CompilerView: React.FC<CompilerViewProps> = ({ getArticleContent }) => {
  const { activeProject, updateProject } = useProjects();
  const { settings, updateSettings } = useSettings();
  const { addToast } = useToasts();
  
  const [activeArticleTitle, setActiveArticleTitle] = useState<string | null>(null);
  const [rightPaneView, setRightPaneView] = useState<RightPaneView>('settings');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    // If the active article is no longer in the project, deselect it.
    if (activeProject && activeArticleTitle && !activeProject.articles.some(a => a.title === activeArticleTitle)) {
      setActiveArticleTitle(null);
      setRightPaneView('settings');
    }
  }, [activeProject, activeArticleTitle]);

  const handleSelectArticle = (title: string) => {
    if (activeArticleTitle === title) {
        setActiveArticleTitle(null);
        setRightPaneView('settings');
    } else {
        setActiveArticleTitle(title);
        setRightPaneView('article');
    }
  };
  
  const handleGeneratePdf = useCallback(async (options: any) => {
    if (!activeProject || !settings) return;
    setIsGeneratingPdf(true);
    try {
      await generatePdf(activeProject, options, settings, getArticleContent, addToast);
    } catch (error) {
      console.error("PDF generation failed:", error);
      addToast('PDF generation failed.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [activeProject, settings, getArticleContent, addToast]);

  const handleGenerateMarkdown = useCallback(async () => {
    if (!activeProject) return;
    try {
      await generateMarkdown(activeProject, getArticleContent);
    } catch (error) {
      console.error("Markdown generation failed:", error);
      addToast('Markdown generation failed.', 'error');
    }
  }, [activeProject, getArticleContent, addToast]);
  
  const handleGenerateJson = useCallback(async () => {
    if (!activeProject) return;
    try {
        await generateJsonFile(activeProject, getArticleContent);
    } catch (error) {
        console.error("JSON export failed:", error);
        addToast('JSON export failed.', 'error');
    }
  }, [activeProject, getArticleContent, addToast]);

  const handleGenerateDocx = useCallback(async () => {
    if (!activeProject) return;
    try {
        await generateDocx(activeProject, getArticleContent);
    } catch (error) {
        console.error("DOCX export failed:", error);
        addToast('DOCX export failed.', 'error');
    }
  }, [activeProject, getArticleContent, addToast]);


  if (!activeProject || !settings) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <>
     {isGeneratingPdf && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex flex-col justify-center items-center" aria-live="assertive">
            <Spinner light />
            <p className="text-white text-lg mt-4">Generating your PDF... This may take a moment.</p>
        </div>
      )}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      <CompilerLeftPanel
        project={activeProject}
        updateProject={updateProject}
        activeArticleTitle={activeArticleTitle}
        onSelectArticle={handleSelectArticle}
      />
      <CompilerRightPanel
        key={activeProject.id} // Re-mount when project changes
        project={activeProject}
        updateProject={updateProject}
        activeArticleTitle={activeArticleTitle}
        getArticleContent={getArticleContent}
        settings={settings}
        updateSettings={updateSettings}
        view={rightPaneView}
        setView={setRightPaneView}
        onGeneratePdf={handleGeneratePdf}
        onGenerateMarkdown={handleGenerateMarkdown}
        onGenerateJson={handleGenerateJson}
        onGenerateDocx={handleGenerateDocx}
        isGeneratingPdf={isGeneratingPdf}
      />
    </div>
    </>
  );
};

export default CompilerView;