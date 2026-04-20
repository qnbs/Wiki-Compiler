export enum View {
    Library = 'library',
    Archive = 'archive',
    Compiler = 'compiler',
    Importer = 'importer',
    ImageImporter = 'imageImporter',
    Settings = 'settings',
    Help = 'help',
}

export type RightPaneView = 'settings' | 'article';

export interface ProjectArticle {
    title: string;
}

export interface Project {
    id: string;
    name: string;
    articles: ProjectArticle[];
    notes: string;
    lastActiveView: RightPaneView;
}

export interface ArticleMetadata {
    pageid: number;
    ns: number;
    title: string;
    contentmodel: string;
    pagelanguage: string;
    pagelanguagehtmlcode: string;
    pagelanguagedir: string;
    touched: string;
    lastrevid: number;
    length: number;
    revid?: number;
}

export interface ArticleContent {
    title: string;
    html: string;
    metadata?: ArticleMetadata;
}

export interface SearchResult {
    pageid: number;
    title: string;
    snippet: string;
    timestamp: string;
}

export interface KeyConcept {
    concept: string;
    explanation: string;
}

export interface ArticleInsights {
    summary?: string;
    keyConcepts?: KeyConcept[];
    researchQuestions?: string[];
    readingTimeMinutes: number;
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export type Theme = 'light' | 'dark' | 'system';
export type AccentColorName = 'blue' | 'purple' | 'green' | 'orange' | 'red';

export interface CustomCitation {
    id: string;
    key: string;
    author: string;
    year: string;
    title: string;
    url: string;
}

export interface AppSettings {
    language: string;
    defaultView: View;
    theme: Theme;
    accentColor: AccentColorName;
    library: {
        searchResultLimit: number;
        aiAssistant: {
            enabled: boolean;
            enableThinking: boolean;
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
        citationStyle: 'apa' | 'mla' | 'chicago';
    };
}

export interface ImportedImage {
    id: string;
    srcUrl: string;
    altText: string;
    caption: string;
    originalArticleTitle: string;
    tags: string[];
    category: string;
    notes: string;
}

export interface ProjectArticleContent {
    id: string; // composite key: `${projectId}-${title}`
    projectId: string;
    title: string;
    html: string;
}