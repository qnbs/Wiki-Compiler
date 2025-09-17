# Wiki Compiler: Quellcode-Dokumentation (Teil 3: Services)

Dieses Dokument enthält den Quellcode für alle Services der Anwendung. Diese sind für die Kommunikation mit externen APIs (Wikipedia, Gemini), die Datenbankverwaltung (IndexedDB) und die Datenexportlogik verantwortlich.

---

## `services/citationService.ts`

```typescript
import { getArticleMetadata } from './wikipediaService';
import { ArticleMetadata, CustomCitation } from '../types';

const formatAPA = (meta: ArticleMetadata): string => {
    const date = new Date(meta.touched);
    const year = date.getUTCFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getUTCDate();
    const url = `https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(meta.title.replace(/ /g, '_'))}&oldid=${meta.revid}`;

    return `<i>${meta.title}</i>. (n.d.). In Wikipedia. Retrieved ${month} ${day}, ${year}, from <a href="${url}">${url}</a>`;
};

const formatMLA = (meta: ArticleMetadata): string => {
    const date = new Date(meta.touched);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const url = `https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(meta.title.replace(/ /g, '_'))}&oldid=${meta.revid}`;

    return `"${meta.title}." <i>Wikipedia, The Free Encyclopedia</i>. Wikimedia Foundation, Inc. ${day} ${month}. ${year}. Web. ${day} ${month}. ${year}. &lt;<a href="${url}">${url}</a>&gt;`;
};

const formatCustomAPA = (citation: CustomCitation): string => {
    const authorPart = citation.author ? `${citation.author}.` : '';
    const yearPart = citation.year ? `(${citation.year}).` : '';
    const titlePart = `<i>${citation.title}</i>.`;
    const urlPart = citation.url ? `Retrieved from <a href="${citation.url}">${citation.url}</a>` : '';
    return [authorPart, yearPart, titlePart, urlPart].filter(Boolean).join(' ');
};

const formatCustomMLA = (citation: CustomCitation): string => {
    const authorPart = citation.author ? `${citation.author}.` : '';
    const titlePart = `"${citation.title}."`;
    const yearPart = citation.year ? `, ${citation.year}` : '';
    const urlPart = citation.url ? `, <a href="${citation.url}">${citation.url}</a>.` : '.';
    return `${authorPart} ${titlePart}${yearPart}${urlPart}`;
};


export const formatBibliography = async (
    titles: string[], 
    customCitations: CustomCitation[],
    style: 'apa' | 'mla'
): Promise<string> => {
    try {
        const metadata = await getArticleMetadata(titles);

        const wikiFormatter = style === 'apa' ? formatAPA : formatMLA;
        const customFormatter = style === 'apa' ? formatCustomAPA : formatCustomMLA;

        let bibliographyHtml = `<div class="p-12" style="page-break-before: always;"><h1 class="text-4xl mb-8 border-b pb-2">Bibliography</h1><ul class="list-none space-y-4">`;
        
        metadata.forEach(meta => {
            bibliographyHtml += `<li class="text-base">${wikiFormatter(meta)}</li>`;
        });
        
        customCitations.forEach(citation => {
             bibliographyHtml += `<li class="text-base">${customFormatter(citation)}</li>`;
        });

        bibliographyHtml += `</ul></div>`;
        return bibliographyHtml;

    } catch (error) {
        console.error("Failed to generate bibliography:", error);
        return `<div class="p-12"><h1 class="text-4xl">Bibliography</h1><p>Error generating bibliography.</p></div>`;
    }
};
```

---

## `services/dbService.ts`

```typescript
import { openDB, IDBPDatabase } from 'idb';
import { Project, ArticleContent, AppSettings, ProjectArticleContent, ImportedImage } from '../types';

const DB_NAME = 'WikiCompilerDB';
const DB_VERSION = 4; // Incremented version
const PROJECTS_STORE = 'projects';
const ARTICLES_STORE = 'articles';
const SETTINGS_STORE = 'settings';
const PROJECT_ARTICLES_STORE = 'project-articles';
const IMPORTED_IMAGES_STORE = 'importedImages';
const SETTINGS_KEY = 'app-settings';

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = () => {
  if (dbPromise) return dbPromise;
  
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ARTICLES_STORE)) {
        db.createObjectStore(ARTICLES_STORE, { keyPath: 'title' });
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
            db.createObjectStore(SETTINGS_STORE);
        }
      }
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(PROJECT_ARTICLES_STORE)) {
          db.createObjectStore(PROJECT_ARTICLES_STORE, { keyPath: 'id' });
        }
      }
      if (oldVersion < 4) {
        if (!db.objectStoreNames.contains(IMPORTED_IMAGES_STORE)) {
          db.createObjectStore(IMPORTED_IMAGES_STORE, { keyPath: 'id' });
        }
      }
    },
  });
  return dbPromise;
};

// Project Functions
export const getProjects = async (): Promise<Project[]> => {
  const db = await initDB();
  return db.getAll(PROJECTS_STORE);
};

export const saveProject = async (project: Project): Promise<void> => {
  const db = await initDB();
  await db.put(PROJECTS_STORE, project);
};

export const deleteProject = async (projectId: string): Promise<void> => {
    const db = await initDB();
    await db.delete(PROJECTS_STORE, projectId);
};

// Article Cache Functions
export const getArticleCache = async (title: string): Promise<ArticleContent | null> => {
  const db = await initDB();
  const article: ArticleContent | undefined = await db.get(ARTICLES_STORE, title);
  return article || null;
};

export const getAllArticles = async (): Promise<ArticleContent[]> => {
    const db = await initDB();
    return db.getAll(ARTICLES_STORE);
};

export const saveArticleCache = async (article: ArticleContent): Promise<void> => {
  const db = await initDB();
  await db.put(ARTICLES_STORE, article);
};

export const deleteArticleFromCache = async (title: string): Promise<void> => {
    const db = await initDB();
    await db.delete(ARTICLES_STORE, title);
};

export const clearArticleCache = async (): Promise<void> => {
    const db = await initDB();
    await db.clear(ARTICLES_STORE);
};

export const getCacheSize = async (): Promise<{count: number, size: number}> => {
    const db = await initDB();
    const articles = await db.getAll(ARTICLES_STORE);
    const count = articles.length;
    const size = articles.reduce((acc, article) => {
        return acc + (new Blob([article.html]).size);
    }, 0);
    return { count, size };
}


// Settings Functions
export const getSettings = async (): Promise<AppSettings | null> => {
    const db = await initDB();
    return db.get(SETTINGS_STORE, SETTINGS_KEY);
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
    const db = await initDB();
    await db.put(SETTINGS_STORE, settings, SETTINGS_KEY);
};

// Project-specific Article Content Functions
export const getProjectArticleContent = async (projectId: string, title: string): Promise<ProjectArticleContent | null> => {
    const db = await initDB();
    const id = `${projectId}-${title}`;
    const content: ProjectArticleContent | undefined = await db.get(PROJECT_ARTICLES_STORE, id);
    return content || null;
};

export const saveProjectArticleContent = async (content: ProjectArticleContent): Promise<void> => {
    const db = await initDB();
    await db.put(PROJECT_ARTICLES_STORE, content);
};

// Image Importer Functions
export const getImportedImages = async (): Promise<ImportedImage[]> => {
    const db = await initDB();
    return db.getAll(IMPORTED_IMAGES_STORE);
};

export const saveImportedImage = async (image: ImportedImage): Promise<void> => {
    const db = await initDB();
    await db.put(IMPORTED_IMAGES_STORE, image);
};

export const deleteImportedImage = async (id: string): Promise<void> => {
    const db = await initDB();
    await db.delete(IMPORTED_IMAGES_STORE, id);
};

// Data Management Functions
export const exportAllData = async (): Promise<string> => {
    const db = await initDB();
    const projects = await db.getAll(PROJECTS_STORE);
    const articles = await db.getAll(ARTICLES_STORE);
    const settings = await db.get(SETTINGS_STORE, SETTINGS_KEY);
    const projectArticles = await db.getAll(PROJECT_ARTICLES_STORE);
    const importedImages = await db.getAll(IMPORTED_IMAGES_STORE);

    const data = {
        version: DB_VERSION,
        exportedAt: new Date().toISOString(),
        data: {
            projects,
            articles,
            settings,
            projectArticles,
            importedImages,
        }
    };

    return JSON.stringify(data, null, 2);
};

export const importAllData = async (jsonString: string): Promise<void> => {
    const importData = JSON.parse(jsonString);
    if (!importData.data) throw new Error("Invalid import file format");
    const { projects, articles, settings, projectArticles, importedImages } = importData.data;

    const db = await initDB();

    const storesToClear: string[] = [PROJECTS_STORE, ARTICLES_STORE, PROJECT_ARTICLES_STORE, IMPORTED_IMAGES_STORE];
    for(const storeName of storesToClear) {
        const tx = db.transaction(storeName, 'readwrite');
        await tx.store.clear();
        await tx.done;
    }

    const projectTx = db.transaction(PROJECTS_STORE, 'readwrite');
    for (const project of projects) {
        await projectTx.store.add(project);
    }
    await projectTx.done;
    
    const articleTx = db.transaction(ARTICLES_STORE, 'readwrite');
    for (const article of articles) {
        await articleTx.store.add(article);
    }
    await articleTx.done;

    if (projectArticles) {
        const projectArticleTx = db.transaction(PROJECT_ARTICLES_STORE, 'readwrite');
        for (const pa of projectArticles) {
            await projectArticleTx.store.add(pa);
        }
        await projectArticleTx.done;
    }

    if (importedImages) {
        const imageTx = db.transaction(IMPORTED_IMAGES_STORE, 'readwrite');
        for (const image of importedImages) {
            await imageTx.store.add(image);
        }
        await imageTx.done;
    }
    
    if (settings) {
        await saveSettings(settings);
    }
};
```

---

## `services/exportService.ts`

```typescript
import { Project } from '../types';
import TurndownService from 'turndown';
import saveAs from 'file-saver';
import { 
    Document, 
    Packer, 
    Paragraph, 
    TextRun, 
    HeadingLevel, 
    ImageRun, 
    ExternalHyperlink,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle
} from 'docx';
import { formatBibliography } from './citationService';
import { getSettings, getProjectArticleContent } from './dbService';

const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

/**
 * Gathers the HTML content for a project, prioritizing edited versions of articles.
 * Combines all articles and appends a formatted bibliography.
 * @param project The project to get content for.
 * @param getArticleContent A fallback function to get original article HTML.
 * @returns A single HTML string containing all project content.
 */
const getHtmlContent = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<string> => {
    const articleHtmlPromises = project.articles.map(async (article) => {
        const editedContent = await getProjectArticleContent(project.id, article.title);
        const html = editedContent ? editedContent.html : await getArticleContent(article.title);
        return `<h1>${article.title}</h1>${html}<div style="page-break-after: always;"></div>`;
    });
    
    const resolvedHtmls = await Promise.all(articleHtmlPromises);
    let combinedHtml = `<div class="p-12">${resolvedHtmls.join('')}`;

    const settings = await getSettings();
    if (settings) {
        const customCitations = settings.citations.customCitations;
        const citationStyle = settings.citations.citationStyle;
        const articleTitles = project.articles.map(a => a.title);

        if (articleTitles.length > 0 || customCitations.length > 0) {
            const bibliography = await formatBibliography(articleTitles, customCitations, citationStyle);
            combinedHtml += bibliography;
        }
    }
    
    combinedHtml += '</div>';
    return combinedHtml;
};

// --- Markdown and JSON Export ---

export const generateMarkdown = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<void> => {
    const html = await getHtmlContent(project, getArticleContent);
    const markdown = turndownService.turndown(html);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${project.name}.md`);
};

export const generateJsonFile = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<void> => {
    const articlesContent = await Promise.all(
        project.articles.map(async (article) => {
            const editedContent = await getProjectArticleContent(project.id, article.title);
            const html = editedContent ? editedContent.html : await getArticleContent(article.title);
            return { title: article.title, html };
        })
    );
    const data = {
        projectName: project.name,
        notes: project.notes,
        articles: articlesContent,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    saveAs(blob, `${project.name}.json`);
};

// --- DOCX Generation Overhaul ---

type DocxChild = TextRun | ImageRun | ExternalHyperlink;

/**
 * Recursively traverses a DOM node and its children to convert them into an array of docx.js objects.
 * @param node The DOM Node to process.
 * @param options Formatting options to apply to text nodes.
 * @returns An array of TextRun, ImageRun, or ExternalHyperlink objects.
 */
// FIX: Refactored processNode to pass styles down recursively, avoiding errors with immutable TextRun objects.
const processNode = async (node: Node, options: { bold?: boolean; italics?: boolean; style?: string } = {}): Promise<DocxChild[]> => {
    if (node.nodeType === Node.TEXT_NODE) {
        return [new TextRun({ text: node.textContent || '', ...options })];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return [];
    }

    const element = node as HTMLElement;
    
    let newOptions = { ...options };
    switch (element.tagName.toUpperCase()) {
        case 'STRONG':
        case 'B':
            newOptions.bold = true;
            break;
        case 'EM':
        case 'I':
            newOptions.italics = true;
            break;
    }

    // Handle specific element types that don't just pass down styles
    switch (element.tagName.toUpperCase()) {
        case 'A':
            const href = (element as HTMLAnchorElement).href;
            const linkChildrenNested = await Promise.all(
                Array.from(element.childNodes).map((childNode) => processNode(childNode, { ...newOptions, style: "Hyperlink" })),
            );
            const linkChildren = linkChildrenNested.flat().filter((c): c is TextRun => c instanceof TextRun);

            return [new ExternalHyperlink({
                children: linkChildren,
                link: href,
            })];

        case 'IMG':
            const imgElement = element as HTMLImageElement;
            const src = imgElement.src;
            if (!src) return [];
            try {
                // Using a proxy might be necessary for CORS issues in a real-world scenario
                const response = await fetch(src);
                const blob = await response.blob();
                 // Ensure blob is an image type before proceeding
                if (!blob.type.startsWith('image/')) {
                    console.warn(`Fetched resource is not an image: ${src}`);
                    return [new TextRun({ text: `[Image: ${src}]`, italics: true })];
                }
                const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(blob);
                });

                return [new ImageRun({
                    // FIX: Added `type: "buffer"` to satisfy the IImageOptions type for some versions of the docx library.
                    type: "buffer",
                    data: buffer,
                    transformation: {
                        // FIX: Cast element to HTMLImageElement to access width and height properties.
                        width: Math.min(imgElement.width, 450) || 450, // Cap width to fit page
                        height: Math.min(imgElement.height, 600) || 300,
                    },
                })];
            } catch (error) {
                console.warn(`Could not fetch image at ${src}:`, error);
                return [new TextRun({ text: `[Image: ${src}]`, italics: true })];
            }
        default:
             // Process children with new options for all other tags
             const childrenNested = await Promise.all(Array.from(element.childNodes).map((childNode) => processNode(childNode, newOptions)));
             return childrenNested.flat();
    }
};

/**
 * Converts an HTML string into an array of docx.js Paragraph and Table objects.
 * @param htmlString The HTML content to convert.
 * @returns A promise that resolves to an array of Paragraphs and Tables.
 */
const htmlToDocxChildren = async (htmlString: string): Promise<(Paragraph | Table)[]> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const elements: (Paragraph | Table)[] = [];

    const processElement = async (el: Element) => {
        switch (el.tagName.toUpperCase()) {
            case 'H1':
            case 'H2':
            case 'H3':
            case 'H4':
                elements.push(new Paragraph({
                    children: await processNode(el),
                    // FIX: Removed incorrect type assertion `as HeadingLevel` as the property accepts a string.
                    heading: `Heading${el.tagName.substring(1)}`,
                }));
                break;
            case 'P':
                elements.push(new Paragraph({ children: await processNode(el) }));
                break;
            case 'UL':
            case 'OL':
                for (const li of Array.from(el.children)) {
                    if (li.tagName.toUpperCase() === 'LI') {
                        elements.push(new Paragraph({
                            children: await processNode(li),
                            bullet: { level: 0 },
                        }));
                    }
                }
                break;
            case 'TABLE':
                const rows: TableRow[] = [];
                for (const tr of Array.from(el.querySelectorAll('tr'))) {
                    const cells: TableCell[] = [];
                    for (const td of Array.from(tr.querySelectorAll('td, th'))) {
                        cells.push(new TableCell({
                            children: [new Paragraph({ children: await processNode(td) })],
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
                                bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
                                left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
                                right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
                            }
                        }));
                    }
                    rows.push(new TableRow({ children: cells }));
                }
                elements.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                break;
            case 'DIV':
            case 'SECTION':
            case 'ARTICLE':
                for (const child of Array.from(el.children)) {
                    await processElement(child);
                }
                break;
        }
    };
    
    for (const child of Array.from(doc.body.children)) {
        await processElement(child);
    }
    
    return elements;
};

const generateDocxBlob = async (html: string, title: string): Promise<Blob> => {
    const content = await htmlToDocxChildren(html);
    const doc = new Document({
        styles: {
            paragraphStyles: [{
                id: "Hyperlink",
                name: "Hyperlink",
                basedOn: "Normal",
                next: "Normal",
                run: { color: "0000FF", underline: {} },
            }]
        },
        sections: [{
            children: [
                new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
                ...content,
            ],
        }],
    });
    return Packer.toBlob(doc);
};

export const generateDocx = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<void> => {
    const html = await getHtmlContent(project, getArticleContent);
    const blob = await generateDocxBlob(html, project.name);
    saveAs(blob, `${project.name}.docx`);
};

export const generateSingleArticleDocx = async (title: string, html: string): Promise<void> => {
    const blob = await generateDocxBlob(html, title);
    saveAs(blob, `${title}.docx`);
};


// --- ODT Generation Improvement ---

const getOdtStyles = () => `
    body { font-family: sans-serif; line-height: 1.5; max-width: 800px; margin: auto; padding: 2em; }
    h1, h2, h3 { line-height: 1.2; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.2em; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    td, th { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    a { color: #0000FF; text-decoration: underline; }
`;

const generateOdtBlob = (html: string): Blob => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Export</title>
    <style>${getOdtStyles()}</style>
</head>
<body>${html}</body>
</html>`;
    return new Blob([fullHtml], { type: 'application/vnd.oasis.opendocument.text' });
};

export const generateOdt = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<void> => {
    const html = await getHtmlContent(project, getArticleContent);
    const blob = generateOdtBlob(html);
    saveAs(blob, `${project.name}.odt`);
};

export const generateSingleArticleOdt = async (title: string, html: string): Promise<void> => {
    const blob = generateOdtBlob(html);
    saveAs(blob, `${title}.odt`);
};
```

---

## `services/geminiService.ts`

```typescript
import { GoogleGenAI, Type } from "@google/genai";
import { ArticleInsights } from '../types';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("API_KEY is not set. AI features will be disabled.");
}

export const isAiConfigured = !!ai;

interface AnalysisFocus {
  summary: boolean;
  keyConcepts: boolean;
  researchQuestions: boolean;
}

const baseInsightsSchema = {
    summary: {
        type: Type.STRING,
        description: 'A concise, 3-5 sentence summary of the article.'
    },
    keyConcepts: {
        type: Type.ARRAY,
        description: 'A list of 5-7 key concepts, people, or places mentioned in the text.',
        items: {
            type: Type.OBJECT,
            properties: {
                concept: { type: Type.STRING, description: 'The name of the concept, person, or place.' },
                explanation: { type: Type.STRING, description: 'A brief, one-sentence explanation of the concept.' }
            },
            required: ['concept', 'explanation']
        }
    },
    researchQuestions: {
        type: Type.ARRAY,
        description: 'A list of 3-4 potential research questions inspired by the article content.',
        items: {
            type: Type.STRING
        }
    },
    readingTimeMinutes: {
        type: Type.INTEGER,
        description: 'An estimated time to read the article in minutes, based on an average reading speed of 200 words per minute.'
    }
};


export const getArticleInsights = async (text: string, systemInstruction: string | undefined, focus: AnalysisFocus): Promise<ArticleInsights> => {
    if (!ai) {
        throw new Error("AI Service is not configured. Please set an API key in your environment.");
    }

    // Limit text size to avoid overly large requests
    const truncatedText = text.length > 30000 ? text.substring(0, 30000) : text;
    
    const properties: any = {};
    const required: string[] = [];
    const promptParts: string[] = [];

    if (focus.summary) {
        properties.summary = baseInsightsSchema.summary;
        required.push('summary');
        promptParts.push('a summary');
    }
    if (focus.keyConcepts) {
        properties.keyConcepts = baseInsightsSchema.keyConcepts;
        required.push('keyConcepts');
        promptParts.push('key concepts');
    }
    if (focus.researchQuestions) {
        properties.researchQuestions = baseInsightsSchema.researchQuestions;
        required.push('researchQuestions');
        promptParts.push('potential research questions');
    }

    // Always include reading time, as it's a simple calculation
    properties.readingTimeMinutes = baseInsightsSchema.readingTimeMinutes;
    required.push('readingTimeMinutes');

    const dynamicSchema = {
        type: Type.OBJECT,
        properties,
        required,
    };
    
    // Join prompt parts with commas and a final "and"
    const promptFocusText = promptParts.length > 1 
        ? promptParts.slice(0, -1).join(', ') + ' and ' + promptParts.slice(-1)
        : promptParts[0] || 'insights';


    try {
        const response = await ai.models.generateContent({
            // FIX: Updated deprecated model to 'gemini-2.5-flash'.
            model: 'gemini-2.5-flash',
            contents: `Analyze the following Wikipedia article text and provide a structured set of insights. Based on the text, generate ${promptFocusText}, and an estimated reading time. TEXT: "${truncatedText}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: dynamicSchema,
                ...(systemInstruction && { systemInstruction }),
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ArticleInsights;

    } catch (error) {
        console.error("Error getting insights from Gemini API:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse AI response. The format might be invalid.");
        }
        if (error instanceof Error && (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('credential'))) {
            throw new Error("Invalid or missing API Key for Gemini. Please check your configuration.");
        }
        throw new Error("Could not generate insights at this time. The service may be unavailable.");
    }
};

export const editTextWithAi = async (instruction: string, textToEdit: string): Promise<string> => {
    if (!ai) {
        throw new Error("AI Service is not configured. Please set an API key in your environment.");
    }

    if (!textToEdit.trim()) {
        return textToEdit;
    }

    try {
        const response = await ai.models.generateContent({
            // FIX: Updated deprecated model to 'gemini-2.5-flash'.
            model: 'gemini-2.5-flash',
            contents: `INSTRUCTION: "${instruction}"\n\nTEXT TO EDIT: "${textToEdit}"`,
            config: {
                systemInstruction: "You are an expert academic editor. You will be given a piece of text and an instruction. You MUST return ONLY the modified text, without any preamble, explanation, or markdown formatting like ```.",
                // Lower temperature for more predictable, deterministic edits
                temperature: 0.2, 
            },
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error editing text with Gemini API:", error);
        if (error instanceof Error && (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('credential'))) {
            throw new Error("Invalid or missing API Key for Gemini. Please check your configuration.");
        }
        throw new Error("Could not perform AI edit at this time. The service may be unavailable.");
    }
};
```

---

## `services/wikipediaService.ts`

```typescript
import i18n from '../i18n';
import { SearchResult, ArticleMetadata, WikipediaQueryResponse, WikipediaSearchItem } from '../types';

const getWikiBase = (): string => {
    const lang = i18n.resolvedLanguage || 'en';
    const supportedLangs = ['en', 'de'];
    const finalLang = supportedLangs.includes(lang) ? lang : 'en';
    return `https://${finalLang}.wikipedia.org`;
}

const getWikiApiBase = () => `${getWikiBase()}/w/api.php`;
const getWikiRestBase = () => `${getWikiBase()}/api/rest_v1/page/html/`;

export const searchArticles = async (query: string, limit: number = 10, sort: string = 'relevance'): Promise<SearchResult[]> => {
  if (!query) return [];
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: String(limit),
    srprop: 'snippet|timestamp',
    srsort: sort,
    format: 'json',
    origin: '*',
  });

  const response = await fetch(`${getWikiApiBase()}?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search results from Wikipedia');
  }
  const data: WikipediaQueryResponse = await response.json();
  return data.query.search.map((item: WikipediaSearchItem) => ({
      ...item,
      snippet: item.snippet.replace(/<[^>]*>/g, '') // strip html tags
  }));
};

export const getArticleHtml = async (title: string): Promise<string> => {
  const response = await fetch(`${getWikiRestBase()}${encodeURIComponent(title)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${title}`);
  }
  let html = await response.text();
  // The REST API wraps content in <html><body>...</body></html>, we only want the inner content.
  const bodyContentMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  let content = bodyContentMatch ? bodyContentMatch[1] : html;

  // Performance Optimization: Add lazy loading to all images
  content = content.replace(/<img /g, '<img loading="lazy" decoding="async" ');
  
  return content;
};

export const getArticleMetadata = async (titles: string[]): Promise<ArticleMetadata[]> => {
    if (titles.length === 0) return [];
    const params = new URLSearchParams({
      action: 'query',
      prop: 'info',
      titles: titles.join('|'),
      format: 'json',
      origin: '*',
    });
  
    const response = await fetch(`${getWikiApiBase()}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch article metadata from Wikipedia');
    }
    const data = await response.json();
    const pages = data.query.pages;
    return Object.values(pages) as ArticleMetadata[];
  };
```