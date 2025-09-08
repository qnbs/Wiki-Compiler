import TurndownService from 'https://esm.sh/turndown@7.1.3';
import { Project, PdfOptions, ProjectArticle } from '../types';
import { formatBibliography } from './citationService';

// Turndown service instantiated once for efficiency
// @ts-ignore
const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

const fetchAllArticles = async (
    articles: ProjectArticle[], 
    getArticleContent: (title: string) => Promise<string>
): Promise<{title: string, html: string}[]> => {
    return Promise.all(
        articles.map(async article => ({
            title: article.title,
            html: await getArticleContent(article.title),
        }))
    );
};

export const generatePdf = async (
    project: Project,
    options: PdfOptions,
    getArticleContent: (title: string) => Promise<string>
): Promise<void> => {
    const contentContainer = document.createElement('div');
    contentContainer.style.visibility = 'hidden';
    contentContainer.style.position = 'absolute';
    contentContainer.style.left = '-9999px';
    document.body.appendChild(contentContainer);

    try {
        const allArticleHtml = await fetchAllArticles(project.articles, getArticleContent);
        
        let tocHtml = '';
        if (options.includeTOC) {
            tocHtml = `<div class="p-12" style="page-break-after: always;"><h1 class="text-4xl text-center mb-8">Table of Contents</h1><ul class="list-none space-y-2">`;
            allArticleHtml.forEach((article, index) => {
                tocHtml += `<li class="text-lg"><a href="#article-toc-${index}">${article.title}</a></li>`;
            });
            tocHtml += `</ul></div>`;
        }

        let bibliographyHtml = '';
        if (options.includeBibliography) {
            bibliographyHtml = await formatBibliography(
                project.articles.map(a => a.title), 
                options.citationStyle
            );
        }
        
        const articlesHtml = allArticleHtml.map((article, index) => {
            return `<div class="p-12" style="page-break-after: always;">
                        <h2 class="text-3xl font-bold mb-6 border-b pb-2" id="article-toc-${index}">${article.title}</h2>
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
                line-height: 1.6;
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
    
        // @ts-ignore
        await html2pdf().set({
          margin: 0.5,
          filename: `${project.name.replace(/ /g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: options.paperSize, orientation: 'portrait' }
        }).from(contentContainer).save();

    } finally {
        document.body.removeChild(contentContainer);
    }
};

export const generateMarkdown = async (
    project: Project,
    getArticleContent: (title: string) => Promise<string>
): Promise<void> => {
    const allArticleHtml = await fetchAllArticles(project.articles, getArticleContent);
    
    const markdownContent = allArticleHtml.map(article => {
        const markdown = turndownService.turndown(article.html);
        return `# ${article.title}\n\n${markdown}`;
    }).join('\n\n---\n\n');

    const fullMarkdown = `# ${project.name}\n\n${markdownContent}`;

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