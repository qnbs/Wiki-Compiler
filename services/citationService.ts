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