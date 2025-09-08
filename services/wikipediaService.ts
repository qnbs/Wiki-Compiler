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