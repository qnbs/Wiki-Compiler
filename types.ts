import { RightPaneView } from './components/CompilerView';

export interface SearchResult {
  title: string;
  snippet: string;
  pageid: number;
  timestamp?: string;
}

export interface ArticleContent {
  title: string;
  html: string;
  metadata?: ArticleMetadata;
}

export interface ProjectArticle {
  title:string;
}

export interface Project {
  id: string;
  name: string;
  articles: ProjectArticle[];
  notes?: string;
  lastActiveView?: RightPaneView;
}

export enum View {
  Library = 'library',
  Archive = 'archive',
  Compiler = 'compiler',
  Settings = 'settings',
  Help = 'help'
}

export interface ArticleMetadata {
    pageid: number;
    revid: number;
    touched: string;
    title: string;
}

export interface AiInsightKeyConcept {
    concept: string;
    explanation: string;
}

export interface ArticleInsights {
    summary?: string;
    keyConcepts?: AiInsightKeyConcept[];
    researchQuestions?: string[];
    readingTimeMinutes: number;
}

export type AccentColor = 'blue' | 'purple' | 'green' | 'orange';

export interface CustomCitation {
  id: string;
  key: string; // e.g., "Smith2023"
  author: string;
  year: string;
  title: string;
  url: string;
}

export interface ProjectArticleContent {
  id: string; // composite key: `${projectId}-${title}`
  projectId: string;
  title: string;
  html: string;
}

export interface AppSettings {
  language: string;
  accentColor: AccentColor;
  defaultView: View;
  library: {
    searchResultLimit: number;
    aiAssistant: {
      enabled: boolean;
      systemInstruction: string;
      focus: {
        summary: boolean;
        keyConcepts: boolean;
        researchQuestions: boolean;
      };
    };
  };
  citations: {
    customCitations: CustomCitation[];
    citationStyle: 'apa' | 'mla';
  };
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// Types for Wikipedia API responses for better type safety
export interface WikipediaSearchItem {
    ns: number;
    title: string;
    pageid: number;
    size: number;
    wordcount: number;
    snippet: string;
    timestamp: string;
}

export interface WikipediaQueryResponse {
    batchcomplete: string;
    query: {
        search: WikipediaSearchItem[];
    };
}