import { Project } from '../types';
import TurndownService from 'turndown';
import saveAs from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, ExternalHyperlink, PageBreak, IStylesOptions, UnderlineType } from 'docx';
import { getSettings } from './dbService';
import { formatBibliography } from './citationService';

// --- ODT Generation Utilities ---

const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

const ODT_TEMPLATES = {
    mimetype: 'application/vnd.oasis.opendocument.text',
    'META-INF/manifest.xml': `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
    <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/>
    <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
    <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
    <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`,
    'meta.xml': `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.2" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.2" office:version="1.2">
    <office:meta>
        <meta:generator>Wiki Compiler</meta:generator>
        <meta:creation-date>${new Date().toISOString()}</meta:creation-date>
    </office:meta>
</office:document-meta>`,
    'styles.xml': `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.2" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
    <office:styles>
        <style:style style:name="Standard" style:family="paragraph" />
        <style:style style:name="Heading" style:family="paragraph" style:parent-style-name="Standard">
            <style:text-properties fo:font-weight="bold" />
        </style:style>
        <style:style style:name="H1" style:family="paragraph" style:parent-style-name="Heading">
            <style:text-properties fo:font-size="24pt" />
        </style:style>
        <style:style style:name="H2" style:family="paragraph" style:parent-style-name="Heading">
            <style:text-properties fo:font-size="18pt" />
        </style:style>
        <style:style style:name="Text_20_body" style:family="paragraph" style:parent-style-name="Standard"/>
        <style:style style:name="Link" style:family="text">
            <style:text-properties fo:color="#0000FF" text:underline-style="solid" text:underline-width="auto" text:underline-color="font-color"/>
        </style:style>
        <style:style style:name="Bold" style:family="text">
            <style:text-properties fo:font-weight="bold" style:font-weight-asian="bold" style:font-weight-complex="bold"/>
        </style:style>
        <style:style style:name="Italic" style:family="text">
            <style:text-properties fo:font-style="italic" style:font-style-asian="italic" style:font-style-complex="italic"/>
        </style:style>
    </office:styles>
</office:document-styles>`,
    'content.xml': (body: string) => `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.2" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" office:version="1.2">
    <office:body>
        <office:text>
            ${body}
        </office:text>
    </office:body>
</office:document-content>`
};

function htmlToOdtXml(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    function parseChildren(node: Node): string {
        let result = '';
        node.childNodes.forEach(child => {
            result += parseNode(child);
        });
        return result;
    }

    function parseNode(node: Node): string {
        if (node.nodeType === Node.TEXT_NODE) {
            return escapeXml(node.textContent || '');
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        const el = node as HTMLElement;
        switch (el.nodeName) {
            case 'H1': return `<text:h text:outline-level="1" text:style-name="H1">${parseChildren(el)}</text:h>`;
            case 'H2': return `<text:h text:outline-level="2" text:style-name="H2">${parseChildren(el)}</text:h>`;
            case 'P': return `<text:p text:style-name="Text_20_body">${parseChildren(el)}</text:p>`;
            case 'B': case 'STRONG': return `<text:span text:style-name="Bold">${parseChildren(el)}</text:span>`;
            case 'I': case 'EM': return `<text:span text:style-name="Italic">${parseChildren(el)}</text:span>`;
            case 'A':
                const href = el.getAttribute('href') || '';
                return `<text:a xlink:type="simple" xlink:href="${escapeXml(href)}" text:style-name="Link" text:visited-style-name="Link">${parseChildren(el)}</text:a>`;
            case 'UL': case 'OL':
                let listXml = '<text:list>';
                el.querySelectorAll('li').forEach(li => {
                    listXml += `<text:list-item><text:p text:style-name="Text_20_body">${parseChildren(li)}</text:p></text:list-item>`;
                });
                listXml += '</text:list>';
                return listXml;
            case 'BR': return '<text:line-break/>';
            default: return parseChildren(el);
        }
    }

    return parseChildren(doc.body);
}


// --- DOCX Generation Utilities ---

const getHeadingLevel = (level: number) => {
    // FIX: Removed explicit type annotation to let TypeScript infer it, resolving compiler confusion.
    const levelMap = {
        1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5, 6: HeadingLevel.HEADING_6,
    };
    return levelMap[level as keyof typeof levelMap] || HeadingLevel.HEADING_1;
};

const parseInline = (node: Node, options: { bold?: boolean, italic?: boolean } = {}): (TextRun | ExternalHyperlink)[] => {
    const runs: (TextRun | ExternalHyperlink)[] = [];
    node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            runs.push(new TextRun({ text: child.textContent || '', ...options }));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as HTMLElement;

            if (el.nodeName === 'A') {
                const href = el.getAttribute('href');
                if (href) {
                    runs.push(new ExternalHyperlink({
                        children: [new TextRun({ text: el.textContent || '', style: "Hyperlink" })],
                        link: href
                    }));
                    return;
                }
            }
            
            const newOptions = { ...options };
            if (el.nodeName === 'B' || el.nodeName === 'STRONG') {
                newOptions.bold = true;
            }
            if (el.nodeName === 'I' || el.nodeName === 'EM') {
                newOptions.italic = true;
            }
            runs.push(...parseInline(el, newOptions));
        }
    });
    return runs;
};

const parseHtmlToDocx = (html: string): Paragraph[] => {
    const elements: Paragraph[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.body.childNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;

        if (el.nodeName.match(/^H[1-6]$/)) {
            const level = parseInt(el.nodeName.substring(1), 10);
            elements.push(new Paragraph({
                children: parseInline(el),
                heading: getHeadingLevel(level),
            }));
        } else if (el.nodeName === 'P') {
            elements.push(new Paragraph({ children: parseInline(el) }));
        } else if (el.nodeName === 'UL' || el.nodeName === 'OL') {
            el.querySelectorAll('li').forEach(li => {
                elements.push(new Paragraph({
                    children: parseInline(li),
                    bullet: { level: 0 }
                }));
            });
        }
    });

    return elements;
};

// --- Export Service ---

const turndownService = new TurndownService({ headingStyle: 'atx' });

const getFullHtmlForExport = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<string> => {
    let combinedHtml = `<h1>${escapeXml(project.name)}</h1>`;
    
    if (project.notes) {
        combinedHtml += `<h2>Project Notes</h2><p>${escapeXml(project.notes).replace(/\n/g, '<br/>')}</p>`;
    }

    const articles = await Promise.all(
        project.articles.map(async (article) => ({
            title: article.title,
            html: await getArticleContent(article.title),
        }))
    );
    
    articles.forEach(article => {
        combinedHtml += `<hr><h1>${escapeXml(article.title)}</h1>${article.html}`;
    });

    const settings = await getSettings();
    if (settings) {
        const bibHtml = await formatBibliography(
            project.articles.map(a => a.title),
            settings.citations.customCitations,
            settings.citations.citationStyle
        );
        combinedHtml += bibHtml.replace('<div class="p-12" style="page-break-before: always;">', '<hr>');
    }
    
    return combinedHtml;
};

export const generateMarkdown = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<void> => {
    const fullHtml = await getFullHtmlForExport(project, getArticleContent);
    const markdown = turndownService.turndown(fullHtml);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${project.name}.md`);
};

export const generateJsonFile = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<void> => {
    const articles = await Promise.all(
        project.articles.map(async (article) => ({
            title: article.title,
            html: await getArticleContent(article.title),
        }))
    );
    const data = {
        projectName: project.name,
        projectNotes: project.notes,
        articles,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    saveAs(blob, `${project.name}.json`);
};

export const generateDocx = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<void> => {
    const fullHtml = await getFullHtmlForExport(project, getArticleContent);
    const docxSections = fullHtml.split('<hr>').map(htmlSection => parseHtmlToDocx(htmlSection));

    const children: Paragraph[] = [];
    docxSections.forEach((section, index) => {
        if (index > 0) {
            children.push(new Paragraph({ children: [new PageBreak()] }));
        }
        children.push(...section);
    });

    const doc = new Document({
        styles: {
            characterStyles: [{
                id: "Hyperlink",
                name: "Hyperlink",
                run: {
                    color: "0000FF",
                    underline: {
                        type: UnderlineType.SINGLE,
                    },
                },
            }],
        },
        sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${project.name}.docx`);
};

export const generateOdt = async (project: Project, getArticleContent: (title: string) => Promise<string>): Promise<void> => {
    // @ts-ignore
    const zip = new JSZip();
    
    const fullHtml = await getFullHtmlForExport(project, getArticleContent);
    const contentBodyXml = htmlToOdtXml(fullHtml.replace(/<hr>/g, '<p style="page-break-before:always"></p>'));

    zip.file('mimetype', ODT_TEMPLATES.mimetype, { compression: "STORE" });
    zip.file('META-INF/manifest.xml', ODT_TEMPLATES['META-INF/manifest.xml']);
    zip.file('meta.xml', ODT_TEMPLATES['meta.xml']);
    zip.file('styles.xml', ODT_TEMPLATES['styles.xml']);
    zip.file('content.xml', ODT_TEMPLATES['content.xml'](contentBodyXml));

    const blob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.oasis.opendocument.text'
    });
    saveAs(blob, `${project.name}.odt`);
};


// --- Single Article Export Functions ---
export const generateSingleArticleDocx = async (title: string, htmlContent: string): Promise<void> => {
    const children = parseHtmlToDocx(htmlContent);
    const doc = new Document({
        styles: {
            characterStyles: [{
                id: "Hyperlink",
                name: "Hyperlink",
                run: {
                    color: "0000FF",
                    underline: {
                        type: UnderlineType.SINGLE,
                    },
                },
            }],
        },
        sections: [{ children }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
};

export const generateSingleArticleOdt = async (title: string, htmlContent: string): Promise<void> => {
    // @ts-ignore
    const zip = new JSZip();
    const contentBodyXml = htmlToOdtXml(htmlContent);

    zip.file('mimetype', ODT_TEMPLATES.mimetype, { compression: "STORE" });
    zip.file('META-INF/manifest.xml', ODT_TEMPLATES['META-INF/manifest.xml']);
    zip.file('meta.xml', ODT_TEMPLATES['meta.xml']);
    zip.file('styles.xml', ODT_TEMPLATES['styles.xml']);
    zip.file('content.xml', ODT_TEMPLATES['content.xml'](contentBodyXml));

    const blob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.oasis.opendocument.text'
    });
    saveAs(blob, `${title}.odt`);
};
