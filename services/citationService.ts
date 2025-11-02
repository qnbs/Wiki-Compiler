import { getArticleMetadata } from './wikipediaService';

const formatAPA = (meta) => {
    const date = new Date(meta.touched);
    const year = date.getUTCFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getUTCDate();
    const url = `https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(meta.title.replace(/ /g, '_'))}&oldid=${meta.revid}`;

    return `<i>${meta.title}</i>. (n.d.). In Wikipedia. Retrieved ${month} ${day}, ${year}, from <a href="${url}">${url}</a>`;
};

const formatMLA = (meta) => {
    const date = new Date(meta.touched);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const url = `https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(meta.title.replace(/ /g, '_'))}&oldid=${meta.revid}`;

    return `"${meta.title}." <i>Wikipedia, The Free Encyclopedia</i>. Wikimedia Foundation, Inc. ${day} ${month}. ${year}. Web. ${day} ${month}. ${year}. &lt;<a href="${url}">${url}</a>&gt;`;
};

const formatChicago = (meta) => {
    const date = new Date(meta.touched);
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const url = `https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(meta.title.replace(/ /g, '_'))}&oldid=${meta.revid}`;

    return `Wikipedia, s.v. "${meta.title}," last modified ${month} ${day}, ${year}, <a href="${url}">${url}</a>.`;
};

const formatCustomAPA = (citation) => {
    const authorPart = citation.author ? `${citation.author}.` : '';
    const yearPart = citation.year ? `(${citation.year}).` : '';
    const titlePart = `<i>${citation.title}</i>.`;
    const urlPart = citation.url ? `Retrieved from <a href="${citation.url}">${citation.url}</a>` : '';
    return [authorPart, yearPart, titlePart, urlPart].filter(Boolean).join(' ');
};

const formatCustomMLA = (citation) => {
    const authorPart = citation.author ? `${citation.author}.` : '';
    const titlePart = `"${citation.title}."`;
    const yearPart = citation.year ? `, ${citation.year}` : '';
    const urlPart = citation.url ? `, <a href="${citation.url}">${citation.url}</a>.` : '.';
    return `${authorPart} ${titlePart}${yearPart}${urlPart}`;
};

const formatCustomChicago = (citation) => {
    const authorPart = citation.author ? `${citation.author}.` : '';
    const titlePart = `"${citation.title}."`;
    const yearPart = citation.year ? `${citation.year}.` : '';
    const urlPart = citation.url ? `<a href="${citation.url}">${citation.url}</a>.` : '';
    return [authorPart, titlePart, yearPart, urlPart].filter(Boolean).join(' ');
};


export const formatBibliography = async (
    titles, 
    customCitations,
    style
) => {
    try {
        const metadata = await getArticleMetadata(titles);

        let wikiFormatter;
        let customFormatter;

        switch (style) {
            case 'mla':
                wikiFormatter = formatMLA;
                customFormatter = formatCustomMLA;
                break;
            case 'chicago':
                wikiFormatter = formatChicago;
                customFormatter = formatCustomChicago;
                break;
            case 'apa':
            default:
                wikiFormatter = formatAPA;
                customFormatter = formatCustomAPA;
                break;
        }

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
