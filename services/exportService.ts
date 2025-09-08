import TurndownService from 'turndown';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, IParagraphOptions, IRunOptions } from 'docx';
import { Project, AppSettings, CustomCitation, ToastType } from '../types';
import { formatBibliography } from './citationService';
import { getProjectArticleContent } from './dbService';

declare var JSZip: any;

// Turndown service instantiated once and configured for all markdown exports
// @ts-ignore
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
});

// Rule for infoboxes to convert them to blockquotes with a clear title
turndownService.addRule('infobox', {
  filter: (node) => node.nodeName === 'DIV' && node.classList.contains('infobox'),
  replacement: (content) => `\n> **Infobox**\n> ${content.trim().replace(/\n+/g, '\n> ')}\n`,
});

// Rule for citations to make them distinct in Markdown
turndownService.addRule('cite', {
  filter: (node) => node.nodeName === 'CITE' && (node as HTMLElement).hasAttribute('data-citation-key'),
  replacement: (content, node) => {
    const key = (node as HTMLElement).getAttribute('data-citation-key');
    // Format as: (Smith, 2023) [ref: Smith2023]
    return `${content} **[ref: ${key}]**`;
  },
});


const fetchAllArticleContent = async (
    project: Project,
    getArticleContent: (title: string) => Promise<string>
): Promise<{title: string, html: string}[]> => {
    return Promise.all(
        project.articles.map(async article => {
            let html;
            const modifiedContent = await getProjectArticleContent(project.id, article.title);
            if (modifiedContent) {
                html = modifiedContent.html;
            } else {
                html = await getArticleContent(article.title);
            }
            return { title: article.title, html };
        })
    );
};

const generateHtmlContent = async (
    project: Project,
    settings: AppSettings,
    getArticleContent: (title: string) => Promise<string>
): Promise<string> => {
    const allArticleContent = await fetchAllArticleContent(project, getArticleContent);
        
    let tocHtml = `<div><h2>Table of Contents</h2><ul>`;
    allArticleContent.forEach((article, index) => {
        const anchor = article.title.replace(/[^a-zA-Z0-9]/g, '') + index;
        tocHtml += `<li><a href="#${anchor}">${article.title}</a></li>`;
    });
    tocHtml += `</ul></div>`;

    const citationKeyRegex = /<cite data-citation-key="([^"]+)">/g;
    const usedCitationKeys = new Set<string>();
    const wikiArticleTitles = new Set<string>(project.articles.map(a => a.title));

    for (const article of allArticleContent) {
        let match;
        while ((match = citationKeyRegex.exec(article.html)) !== null) {
            usedCitationKeys.add(match[1]);
        }
    }

    const customCitationsToInclude: CustomCitation[] = [];
    usedCitationKeys.forEach(key => {
        const found = settings.citations.customCitations.find(c => c.key === key);
        if (found) {
            customCitationsToInclude.push(found);
        } else {
            wikiArticleTitles.add(key); 
        }
    });

    const bibliographyHtml = await formatBibliography(
        Array.from(wikiArticleTitles), 
        customCitationsToInclude,
        settings.citations.citationStyle
    );
    
    const articlesHtml = allArticleContent.map((article, index) => {
        const anchor = article.title.replace(/[^a-zA-Z0-9]/g, '') + index;
        return `<div style="margin-bottom: 2rem;">
                    <h2 id="${anchor}">${article.title}</h2>
                    <div class="prose">${article.html}</div>
                </div>`;
    }).join('');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${project.name}</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1, h2, h3 { line-height: 1.2; }
            a { color: #0066cc; }
            .prose .infobox { border: 1px solid #ccc; background-color: #f9f9f9; float: right; width: 250px; font-size: 0.9em; padding: 5px; margin-left: 1em; margin-bottom: 1em; }
            cite { font-style: normal; }
          </style>
        </head>
        <body>
          <header>
              <h1>${project.name}</h1>
          </header>
          <main>
            ${tocHtml}
            <hr>
            ${articlesHtml}
            ${bibliographyHtml.replace('style="page-break-before: always;"', '')}
          </main>
        </body>
      </html>
    `;
}

export const generateMarkdownContent = async (
    project: Project,
    getArticleContent: (title: string) => Promise<string>
): Promise<string> => {
    const allArticleContent = await fetchAllArticleContent(project, getArticleContent);
    
    let toc = `## Table of Contents\n\n`;
    const articlesWithSlugs = allArticleContent.map(article => {
        const slug = article.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        toc += `* [${article.title}](#${slug})\n`;
        return { ...article, slug };
    });
    
    const markdownContent = articlesWithSlugs.map(article => {
        const markdown = turndownService.turndown(article.html);
        const sourceLink = `\n\n[Source: ${article.title} on Wikipedia](https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replace(/ /g, '_'))})`;
        return `<a name="${article.slug}"></a>\n# ${article.title}\n\n${markdown}${sourceLink}`;
    }).join('\n\n---\n\n');

    const frontmatter = `---
project: "${project.name}"
exported_at: "${new Date().toISOString()}"
---

`;

    return `${frontmatter}# ${project.name}\n\n${toc}\n\n${markdownContent}`;
};


export const generateMarkdown = async (
    project: Project,
    getArticleContent: (title: string) => Promise<string>
): Promise<void> => {
    const fullMarkdown = await generateMarkdownContent(project, getArticleContent);

    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/ /g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const generateHtmlFile = async (
    project: Project,
    settings: AppSettings,
    getArticleContent: (title: string) => Promise<string>
): Promise<void> => {
    const finalHtml = await generateHtmlContent(project, settings, getArticleContent);
    const blob = new Blob([finalHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/ /g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const generatePlainTextFile = async (
    project: Project,
    getArticleContent: (title: string) => Promise<string>
): Promise<void> => {
    const allArticleContent = await fetchAllArticleContent(project, getArticleContent);

    let fullText = `${project.name}\n\n`;
    fullText += "====================================\n\n";

    fullText += allArticleContent.map(article => {
        const markdown = turndownService.turndown(article.html);
        // Strip markdown syntax for a cleaner plain text output, while preserving structure
        const plainText = markdown
            .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Keep link text, remove markdown link
            .replace(/`{1,3}[\s\S]*?`{1,3}/g, '') // Remove code blocks and inline code
            .replace(/#{1,6}\s/g, '') // Remove heading hashes
            .replace(/(\*\*|__)(.*?)(\1)/g, '$2') // Remove bold
            .replace(/(\*|_)(.*?)(\1)/g, '$2') // Remove italic
            .replace(/>\s/g, '') // Remove blockquote indicators
            .replace(/^-{3,}$/gm, '') // Remove horizontal rules
            .replace(/(\r\n|\n|\r){3,}/g, '\n\n') // Collapse multiple newlines to a max of two
            .trim();
            
        const sourceLink = `\n\n[Source: ${article.title} on Wikipedia](https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replace(/ /g, '_'))})`;
        return `## ${article.title}\n\n${plainText}${sourceLink}`;
    }).join('\n\n------------------------------------\n\n');

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/ /g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const generateJsonFile = async (
    project: Project,
    getArticleContent: (title: string) => Promise<string>
): Promise<void> => {
    const allArticleContent = await fetchAllArticleContent(project, getArticleContent);
    const exportData = {
        projectName: project.name,
        projectNotes: project.notes,
        articles: allArticleContent,
        exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/ /g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ODT Generation
const odtTemplates = {
    mimetype: 'application/vnd.oasis.opendocument.text',
    manifest: `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
    <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
    <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
    <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`,
    styles: `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0">
    <office:styles>
        <style:style style:name="Standard" style:family="paragraph" style:class="text"/>
        <style:style style:name="Heading_20_1" style:family="paragraph" style:parent-style-name="Standard" style:class="text">
            <style:text-properties fo:font-weight="bold" style:font-weight-asian="bold" style:font-weight-complex="bold"/>
        </style:style>
        <style:style style:name="T1" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style>
        <style:style style:name="T2" style:family="text"><style:text-properties fo:font-style="italic"/></style:style>
    </office:styles>
</office:document-styles>`,
    contentStart: `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
    <office:body><office:text>`,
    contentEnd: `</office:text></office:body></office:document-content>`
};

const htmlToOdtXml = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const escapeXml = (text: string): string => {
        return text.replace(/[<>&'"]/g, (c) => {
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
    
    const processNode = (node: Node): string => {
        let result = '';
        if (node.nodeType === Node.TEXT_NODE) {
            return escapeXml(node.textContent || '');
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const childrenXml = Array.from(el.childNodes).map(processNode).join('');
            switch (el.nodeName) {
                case 'H1': case 'H2': case 'H3': case 'H4': case 'H5': case 'H6':
                    return `<text:h text:style-name="Heading_20_1" text:outline-level="1">${childrenXml}</text:h>`;
                case 'P':
                    return `<text:p text:style-name="Standard">${childrenXml || ' '}</text:p>`;
                case 'B': case 'STRONG':
                    return `<text:span text:style-name="T1">${childrenXml}</text:span>`;
                case 'I': case 'EM':
                    return `<text:span text:style-name="T2">${childrenXml}</text:span>`;
                case 'UL': case 'OL':
                    return `<text:list>${childrenXml}</text:list>`;
                case 'LI':
                    return `<text:list-item><text:p text:style-name="Standard">${childrenXml}</text:p></text:list-item>`;
                default:
                    return childrenXml;
            }
        }
        return result;
    };
    
    return Array.from(doc.body.childNodes).map(processNode).join('');
};

export const generateOdt = async (
    project: Project,
    getArticleContent: (title: string) => Promise<string>
): Promise<void> => {
    const allArticleContent = await fetchAllArticleContent(project, getArticleContent);
    
    let contentBody = `<text:h text:style-name="Heading_20_1" text:outline-level="1">${project.name}</text:h>`;
    
    allArticleContent.forEach(article => {
        contentBody += `<text:h text:style-name="Heading_20_1" text:outline-level="1">${article.title}</text:h>`;
        contentBody += htmlToOdtXml(article.html);
    });

    const fullContentXml = odtTemplates.contentStart + contentBody + odtTemplates.contentEnd;

    const zip = new JSZip();
    zip.file('mimetype', odtTemplates.mimetype);
    zip.file('styles.xml', odtTemplates.styles);
    zip.file('content.xml', fullContentXml);
    zip.folder('META-INF')?.file('manifest.xml', odtTemplates.manifest);

    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.oasis.opendocument.text' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/ /g, '_')}.odt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


// DOCX Generation
// FIX: The following function was rewritten to fix multiple read-only property assignment errors.
// The previous implementation attempted to mutate properties on IRunOptions and IParagraphOptions,
// which is not allowed. The new implementation constructs the options objects with all properties at once.
const processNode = (node: Node): (Paragraph | TextRun)[] => {
    const children: (Paragraph | TextRun)[] = [];

    const processInlines = (parentNode: Node): TextRun[] => {
        const runs: TextRun[] = [];
        parentNode.childNodes.forEach(childNode => {
            if (childNode.nodeType === Node.TEXT_NODE) {
                runs.push(new TextRun(childNode.textContent || ''));
            } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                const el = childNode as HTMLElement;
                const text = el.textContent || '';
                let options: IRunOptions = { text };
                switch(el.nodeName) {
                    case 'B':
                    case 'STRONG':
                        options = { text, bold: true };
                        break;
                    case 'I':
                    case 'EM':
                        options = { text, italics: true };
                        break;
                }
                runs.push(new TextRun(options));
            }
        });
        return runs;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        // FIX: Corrected a TypeScript error where 'HeadingLevel' was being used as a type but interpreted as a value.
        // Using a lookup on the IParagraphOptions interface correctly resolves the intended type.
        let heading: IParagraphOptions['heading'];
        
        switch (element.nodeName) {
            case 'H1': heading = HeadingLevel.HEADING_1; break;
            case 'H2': heading = HeadingLevel.HEADING_2; break;
            case 'H3': heading = HeadingLevel.HEADING_3; break;
            case 'H4': heading = HeadingLevel.HEADING_4; break;
            case 'P': break; // Standard paragraph
            case 'UL':
            case 'OL':
                element.querySelectorAll('li').forEach(li => {
                    children.push(new Paragraph({ text: li.textContent || '', bullet: { level: 0 } }));
                });
                return children;
            default: // Skip other block elements like DIV, TABLE etc for simplicity
                return [];
        }
        
        children.push(new Paragraph({
            heading,
            children: processInlines(element),
        }));
    }
    
    return children;
};


const htmlToDocxChildren = (html: string): Paragraph[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    return nodes.flatMap(node => processNode(node)).filter(item => item instanceof Paragraph) as Paragraph[];
}


export const generateDocx = async (
    project: Project,
    getArticleContent: (title: string) => Promise<string>
): Promise<void> => {
    const allArticleContent = await fetchAllArticleContent(project, getArticleContent);
    
    const docChildren: Paragraph[] = [
        new Paragraph({
            children: [new TextRun({ text: project.name, size: 48, bold: true })],
            heading: HeadingLevel.TITLE,
        }),
    ];

    allArticleContent.forEach(article => {
        docChildren.push(new Paragraph({
             children: [new TextRun({ text: article.title, size: 36, bold: true })],
             heading: HeadingLevel.HEADING_1,
        }));
        const articleParagraphs = htmlToDocxChildren(article.html);
        docChildren.push(...articleParagraphs);
    });
    
    const doc = new Document({
        sections: [{
            children: docChildren,
        }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/ /g, '_')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};