export interface SearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

export interface ArticleContent {
  title: string;
  html: string;
}

export interface ProjectArticle {
  title: string;
}

export interface Project {
  id: string;
  name: string;
  articles: ProjectArticle[];
}

export enum View {
  Library = 'library',
  Archive = 'archive',
  Compiler = 'compiler',
  Settings = 'settings',
  Help = 'help'
}

export interface TypographyOptions {
  fontPair: 'modern' | 'classic';
  fontSize: number;
}

export interface PdfOptions {
  paperSize: 'letter' | 'a4';
  layout: 'single' | 'two';
  includeTOC: boolean;
  includeBibliography: boolean;
  citationStyle: 'apa' | 'mla';
  typography: TypographyOptions;
  margins: 'normal' | 'narrow' | 'wide';
  lineSpacing: number;
  headerContent: 'title' | 'custom' | 'none';
  footerContent: 'pageNumber' | 'custom' | 'none';
  customHeaderText?: string;
  customFooterText?: string;
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
    summary: string;
    keyConcepts: AiInsightKeyConcept[];
    researchQuestions: string[];
    readingTimeMinutes: number;
}

export type Theme = 'light' | 'dark' | 'system';

export type AccentColor = 'blue' | 'purple' | 'green' | 'orange';

export interface AppSettings {
  theme: Theme;
  language: string;
  accentColor: AccentColor;
  defaultView: View;
  library: {
    searchResultLimit: number;
    aiAssistant: {
      enabled: boolean;
      systemInstruction: string;
    };
  };
  compiler: {
    defaultPdfOptions: PdfOptions;
  };
}