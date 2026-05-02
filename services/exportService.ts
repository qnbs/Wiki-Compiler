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

type DocxHeadingLevel = (typeof HeadingLevel)[keyof typeof HeadingLevel];

function mimeToDocxImageType(mime: string): 'jpg' | 'png' | 'gif' | 'bmp' | null {
    const normalized = mime.split(';')[0]?.trim().toLowerCase() ?? '';
    if (normalized === 'image/jpeg' || normalized === 'image/jpg') return 'jpg';
    if (normalized === 'image/png') return 'png';
    if (normalized === 'image/gif') return 'gif';
    if (normalized === 'image/bmp' || normalized === 'image/x-ms-bmp') return 'bmp';
    return null;
}

/**
 * Gathers the HTML content for a project, prioritizing edited versions of articles.
 * Combines all articles and appends a formatted bibliography.
 * @param project The project to get content for.
 * @param getArticleContent A fallback function to get original article HTML.
 * @returns A single HTML string containing all project content.
 */
const getHtmlContent = async (project, getArticleContent) => {
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

export const generateMarkdown = async (project, getArticleContent) => {
    const html = await getHtmlContent(project, getArticleContent);
    const markdown = turndownService.turndown(html);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${project.name}.md`);
};

export const generateJsonFile = async (project, getArticleContent) => {
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

interface ProcessNodeOptions {
    bold?: boolean;
    italics?: boolean;
    style?: string;
}

/**
 * Recursively traverses a DOM node and its children to convert them into an array of docx.js objects.
 * @param node The DOM Node to process.
 * @param options Formatting options to apply to text nodes.
 * @returns An array of TextRun, ImageRun, or ExternalHyperlink objects.
 */
const processNode = async (node: Node, options: ProcessNodeOptions = {}): Promise<Array<TextRun | ImageRun | ExternalHyperlink>> => {
    if (node.nodeType === Node.TEXT_NODE) {
        return [new TextRun({ text: node.textContent || '', ...options })];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return [];
    }

    const element = node as Element;
    
    let newOptions: ProcessNodeOptions = { ...options };
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

    switch (element.tagName.toUpperCase()) {
        case 'A':
            const href = (element as HTMLAnchorElement).href;
            const linkChildrenNested = await Promise.all(
                Array.from(element.childNodes).map((childNode) => processNode(childNode, { ...newOptions, style: "Hyperlink" })),
            );
            const linkChildren = linkChildrenNested.flat().filter((c): c is TextRun | ImageRun => c instanceof TextRun || c instanceof ImageRun);

            return [new ExternalHyperlink({
                children: linkChildren,
                link: href,
            })];

        case 'IMG':
            const imgElement = element as HTMLImageElement;
            const src = imgElement.src;
            if (!src) return [];
            try {
                const response = await fetch(src);
                if (!response.ok) {
                    console.warn(`Failed to fetch image at ${src}: ${response.status} ${response.statusText}`);
                    return [new TextRun({ text: `[Image not found: ${src}]`, italics: true })];
                }
                const blob = await response.blob();
                if (!blob.type.startsWith('image/')) {
                    console.warn(`Fetched resource is not an image: ${src}`);
                    return [new TextRun({ text: `[Image: ${src}]`, italics: true })];
                }
                const buffer = await blob.arrayBuffer();
                const docxImageType = mimeToDocxImageType(blob.type);
                if (!docxImageType) {
                    console.warn(`DOCX export does not embed image type: ${blob.type}`);
                    return [new TextRun({ text: `[Image (${blob.type}): ${src}]`, italics: true })];
                }

                return [new ImageRun({
                    type: docxImageType,
                    data: buffer,
                    transformation: {
                        width: Math.min(imgElement.naturalWidth, 450) || 450,
                        height: Math.min(imgElement.naturalHeight, 600) || 300,
                    },
                })];
            } catch (error) {
                console.warn(`Could not fetch image at ${src}:`, error);
                return [new TextRun({ text: `[Image failed to load: ${src}]`, italics: true })];
            }
        default:
             const childrenNested = await Promise.all(Array.from(element.childNodes).map((childNode) => processNode(childNode, newOptions)));
             return childrenNested.flat();
    }
};

/**
 * Recursively processes list items (LI) to handle nested lists for DOCX conversion.
 * @param listNode The UL or OL element to process.
 * @param level The current nesting level.
 * @returns A promise that resolves to an array of docx.js Paragraphs.
 */
const processListItems = async (listNode: HTMLUListElement | HTMLOListElement, level: number): Promise<Paragraph[]> => {
    const items: Paragraph[] = [];
    for (const li of Array.from(listNode.children)) {
        if (li.tagName.toUpperCase() !== 'LI') continue;

        const contentChildren: Node[] = [];
        let nestedList: HTMLUListElement | HTMLOListElement | null = null;

        // Separate text content from nested lists within the same LI
        li.childNodes.forEach(child => {
            if (child.nodeName.toUpperCase() === 'UL' || child.nodeName.toUpperCase() === 'OL') {
                nestedList = child as HTMLUListElement | HTMLOListElement;
            } else {
                contentChildren.push(child);
            }
        });

        // Create a temporary element to process only the text content of the LI
        const tempDiv = document.createElement('div');
        contentChildren.forEach(child => tempDiv.appendChild(child.cloneNode(true)));
        
        const paragraphChildren = await processNode(tempDiv);
        
        // Add the main list item paragraph
        if (paragraphChildren.length > 0 || !nestedList) {
            items.push(new Paragraph({
                children: paragraphChildren,
                ...(listNode.tagName.toUpperCase() === 'OL' 
                    ? { numbering: { reference: 'default-ordered', level } }
                    : { bullet: { level } }
                )
            }));
        }
        
        // If there's a nested list, process it recursively
        if (nestedList) {
            const nestedItems = await processListItems(nestedList, level + 1);
            items.push(...nestedItems);
        }
    }
    return items;
};

/**
 * Converts an HTML string into an array of docx.js Paragraph and Table objects.
 * @param htmlString The HTML content to convert.
 * @returns A promise that resolves to an array of Paragraphs and Tables.
 */
const htmlToDocxChildren = async (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const elements: (Paragraph | Table)[] = [];

    const headingMap: Record<string, DocxHeadingLevel> = {
        'H1': HeadingLevel.HEADING_1,
        'H2': HeadingLevel.HEADING_2,
        'H3': HeadingLevel.HEADING_3,
        'H4': HeadingLevel.HEADING_4,
        'H5': HeadingLevel.HEADING_5,
        'H6': HeadingLevel.HEADING_6,
    };

    const processElement = async (el: Element) => {
        const tagName = el.tagName.toUpperCase();
        if (headingMap[tagName]) {
            elements.push(new Paragraph({
                children: await processNode(el),
                heading: headingMap[tagName],
            }));
        } else {
            switch (tagName) {
                case 'P':
                    elements.push(new Paragraph({ children: await processNode(el) }));
                    break;
                case 'UL':
                case 'OL':
                    const listItems = await processListItems(el as HTMLUListElement | HTMLOListElement, 0);
                    elements.push(...listItems);
                    break;
                case 'TABLE':
                    const rows = [];
                    for (const tr of Array.from(el.querySelectorAll('tr'))) {
                        const cells = [];
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
        }
    };
    
    for (const child of Array.from(doc.body.children)) {
        await processElement(child);
    }
    
    return elements;
};

const generateDocxBlob = async (html, title) => {
    const content = await htmlToDocxChildren(html);
    const doc = new Document({
        numbering: {
             config: [
                {
                    reference: "default-ordered",
                    levels: [
                        { level: 0, format: "decimal", text: "%1." },
                        { level: 1, format: "lowerLetter", text: "%2)" },
                        { level: 2, format: "lowerRoman", text: "%3." },
                        { level: 3, format: "decimal", text: "%4." },
                    ],
                },
            ],
        },
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

export const generateDocx = async (project, getArticleContent) => {
    const html = await getHtmlContent(project, getArticleContent);
    const blob = await generateDocxBlob(html, project.name);
    saveAs(blob, `${project.name}.docx`);
};

export const generateSingleArticleDocx = async (title, html) => {
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

const generateOdtBlob = (html) => {
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

export const generateOdt = async (project, getArticleContent) => {
    const html = await getHtmlContent(project, getArticleContent);
    const blob = generateOdtBlob(html);
    saveAs(blob, `${project.name}.odt`);
};

export const generateSingleArticleOdt = async (title, html) => {
    const blob = generateOdtBlob(html);
    saveAs(blob, `${title}.odt`);
};