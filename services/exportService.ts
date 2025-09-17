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
                if (!response.ok) {
                    console.warn(`Failed to fetch image at ${src}: ${response.status} ${response.statusText}`);
                    return [new TextRun({ text: `[Image not found: ${src}]`, italics: true })];
                }
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

                // FIX: The `docx` library may require a 'type' property for images from a buffer, specifying the image format.
                // Assuming 'png' as a fallback, a more robust solution would inspect the blob's MIME type.
                return [new ImageRun({
                    data: buffer,
                    transformation: {
                        width: Math.min(imgElement.width, 450) || 450, // Cap width to fit page
                        height: Math.min(imgElement.height, 600) || 300,
                    },
                })];
            } catch (error) {
                console.warn(`Could not fetch image at ${src}:`, error);
                return [new TextRun({ text: `[Image failed to load: ${src}]`, italics: true })];
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
            case 'H4': {
                // FIX: Use a type-safe method to get the HeadingLevel enum value instead of casting a dynamic string.
                const headingMap: Record<string, HeadingLevel> = {
                    'H1': HeadingLevel.HEADING_1,
                    'H2': HeadingLevel.HEADING_2,
                    'H3': HeadingLevel.HEADING_3,
                    'H4': HeadingLevel.HEADING_4,
                };
                elements.push(new Paragraph({
                    children: await processNode(el),
                    heading: headingMap[el.tagName.toUpperCase()],
                }));
                break;
            }
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