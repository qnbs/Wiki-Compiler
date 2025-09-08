import TurndownService from 'turndown';
import { Project, PdfOptions, AppSettings, CustomCitation, ToastType } from '../types';
import { formatBibliography } from './citationService';
import { getProjectArticleContent } from './dbService';

// Turndown service instantiated once for efficiency
// @ts-ignore
const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

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
                    // It might be a cross-reference to another Wikipedia article
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
            }
            h1, h2, h3, h4, h5, h6 {
                font-family: ${fonts[fontPair].heading};
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
        
        const finalHtml = `
          <html>
            <head>
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
        contentContainer.innerHTML = finalHtml;
    
        const marginMap = {
            normal: 0.75,
            narrow: 0.5,
            wide: 1.0,
        };
        const marginInInches = marginMap[options.margins];

        // @ts-ignore
        const worker = html2pdf().set({
          margin: marginInInches,
          filename: `${project.name.replace(/ /g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: options.paperSize, orientation: 'portrait' }
        }).from(contentContainer).toPdf();

        const pdf = await worker.get('pdf');
        const totalPages = pdf.internal.getNumberOfPages();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        
        // Don't add header/footer to Title page, TOC, or Bibliography
        const firstContentPage = 1 + (options.includeTOC ? 1 : 0) + 1;
        const lastContentPage = totalPages - (options.includeBibliography ? 1 : 0);

        for (let i = firstContentPage; i <= lastContentPage; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(100); // gray color

            // Header
            if (options.headerContent === 'title') {
                pdf.text(project.name, marginInInches, marginInInches / 1.5);
            } else if (options.headerContent === 'custom' && options.customHeaderText) {
                pdf.text(options.customHeaderText, marginInInches, marginInInches / 1.5);
            }

            // Footer
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

        await pdf.save();

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
    
    const markdownContent = allArticleContent.map(article => {
        const markdown = turndownService.turndown(article.html);
        const sourceLink = `\n\n[Source: ${article.title} on Wikipedia](https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replace(/ /g, '_'))})`;
        return `# ${article.title}\n\n${markdown}${sourceLink}`;
    }).join('\n\n---\n\n');

    return `# ${project.name}\n\n${markdownContent}`;
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