import TurndownService from 'turndown';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, IParagraphOptions, IRunOptions } from 'docx';
import { Project, PdfOptions, AppSettings, CustomCitation, ToastType } from '../types';
import { formatBibliography } from './citationService';
import { getProjectArticleContent } from './dbService';

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

const buildExportHtml = async (
    project: Project,
    options: PdfOptions,
    settings: AppSettings,
    getArticleContent: (title: string) => Promise<string>
): Promise<string> => {
    const allArticleContent = await fetchAllArticleContent(project, getArticleContent);
        
    let tocHtml = '';
    if (options.includeTOC) {
        tocHtml = `<div class="p-12" style="page-break-after: always;"><h1 class="text-4xl text-center mb-8">Table of Contents</h1><ul class="list-none space-y-2">`;
        allArticleContent.forEach((article, index) => {
            const anchor = article.title.replace(/[^a-zA-Z0-9]/g, '') + index;
            tocHtml += `<li class="text-lg"><a href="#${anchor}">${article.title}</a></li>`;
        });
        tocHtml += `</ul></div>`;
    }

    let bibliographyHtml = '';
    if (options.includeBibliography) {
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
                // Assuming if not found in custom, it might be a project article title used as a key
                // This logic may need refinement based on citation implementation
                wikiArticleTitles.add(key); 
            }
        });

        bibliographyHtml = await formatBibliography(
            Array.from(wikiArticleTitles), 
            customCitationsToInclude,
            options.citationStyle
        );
    }
    
    const articlesHtml = allArticleContent.map((article, index) => {
        const anchor = article.title.replace(/[^a-zA-Z0-9]/g, '') + index;
        return `<div class="p-12" style="page-break-after: always;">
                    <h2 class="text-3xl font-bold mb-6 border-b pb-2" id="${anchor}">${article.title}</h2>
                    <div class="prose max-w-none">${article.html}</div>
                </div>`;
    }).join('');

    const { fontPair, fontSize } = options.typography;
    const fonts = {
        modern: { body: "'Inter', sans-serif", heading: "'Inter', sans-serif" },
        classic: { body: "'Lora', serif", heading: "'Lora', serif" },
    };
    
    const typographyStyles = `
        body, .prose { 
            font-family: ${fonts[fontPair].body}; 
            font-size: ${fontSize}px;
            line-height: ${options.lineSpacing};
            widows: 3;
            orphans: 3;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: ${fonts[fontPair].heading};
        }
        .prose figure, .prose table, .prose blockquote {
             page-break-inside: avoid;
        }
    `;

    const columnStyles = options.layout === 'two' ? `
      .prose { 
        column-count: 2; 
        column-gap: 2rem;
      }
      .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
        column-span: all;
      }
    ` : '';
    
    return `
      <html>
        <head>
          <title>${project.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            body { color: #121212; }
            .prose { max-width: none; }
            .prose a { color: #2563eb; text-decoration: none; }
            .prose a:hover { text-decoration: underline; }
            .prose .infobox { border: 1px solid #e2e8f0; background-color: #f8fafc; float: right; width: 256px; font-size: 0.875rem; padding: 0.5rem; margin-left: 1rem; margin-bottom: 1rem; }
            h1,h2,h3,h4,h5,h6 { font-weight: bold; }
            cite { font-style: normal; }
            ${typographyStyles}
            ${columnStyles}
          </style>
        </head>
        <body>
          <div class="p-12" style="page-break-after: always;">
              <h1 class="text-5xl text-center mt-48" style="font-family: ${fonts[fontPair].heading};">${project.name}</h1>
          </div>
          ${tocHtml}
          ${articlesHtml}
          ${bibliographyHtml}
        </body>
      </html>
    `;
}

export const generatePdf = async (
    project: Project,
    options: PdfOptions,
    settings: AppSettings,
    getArticleContent: (title: string) => Promise<string>,
    addToast: (message: string, type: ToastType) => void
): Promise<void> => {
    const contentContainer = document.createElement('div');
    contentContainer.style.visibility = 'hidden';
    contentContainer.style.position = 'absolute';
    contentContainer.style.left = '-9999px';
    document.body.appendChild(contentContainer);

    try {
        const finalHtml = await buildExportHtml(project, options, settings, getArticleContent);
        contentContainer.innerHTML = finalHtml;
    
        const marginMap = {
            normal: 0.75,
            narrow: 0.5,
            wide: 1.0,
        };
        const marginInInches = marginMap[options.margins];

        // @ts-ignore
        const promise = html2pdf().set({
            margin: marginInInches,
            filename: `${project.name.replace(/ /g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'in', format: options.paperSize, orientation: 'portrait' }
        }).from(contentContainer).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            if (totalPages <= 1) return;

            const pageHeight = pdf.internal.pageSize.getHeight();
            const pageWidth = pdf.internal.pageSize.getWidth();
            
            // Logic to avoid adding headers/footers on title, TOC, and bibliography pages
            const firstContentPage = 1 + (options.includeTOC ? 1 : 0) + 1; // Page after Title and TOC
            const lastContentPage = totalPages - (options.includeBibliography ? 1 : 0); // Page before Bibliography

            for (let i = firstContentPage; i <= lastContentPage; i++) {
                if (i > totalPages) break;
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(100);

                if (options.headerContent === 'title') {
                    pdf.text(project.name, marginInInches, marginInInches / 1.5);
                } else if (options.headerContent === 'custom' && options.customHeaderText) {
                    pdf.text(options.customHeaderText, marginInInches, marginInInches / 1.5);
                }

                if (options.footerContent === 'pageNumber') {
                    const pageNumText = `${i}`;
                    const textWidth = pdf.getStringUnitWidth(pageNumText) * 10 / pdf.internal.scaleFactor;
                    pdf.text(pageNumText, (pageWidth / 2) - (textWidth / 2), pageHeight - marginInInches / 2);
                } else if (options.footerContent === 'custom' && options.customFooterText) {
                    const text = options.customFooterText;
                    const textWidth = pdf.getStringUnitWidth(text) * 10 / pdf.internal.scaleFactor;
                    pdf.text(text, (pageWidth / 2) - (textWidth / 2), pageHeight - marginInInches / 2);
                }
            }
        }).save();

        await promise;

    } catch(err) {
        console.error("PDF generation failed inside service:", err);
        addToast("PDF generation failed.", "error");
    }
    finally {
        document.body.removeChild(contentContainer);
    }
};

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
    options: PdfOptions,
    settings: AppSettings,
    getArticleContent: (title: string) => Promise<string>
): Promise<void> => {
    const finalHtml = await buildExportHtml(project, options, settings, getArticleContent);
    const blob = new Blob([finalHtml], { type: 'text/html;charset=utf-t' });
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