import { SearchResult, ArticleMetadata } from '../types';

const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';
const WIKI_REST_BASE = 'https://en.wikipedia.org/api/rest_v1/page/html/';

export const searchArticles = async (query: string, limit: number = 10): Promise<SearchResult[]> => {
  if (!query) return [];
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: String(limit),
    format: 'json',
    origin: '*',
  });

  const response = await fetch(`${WIKI_API_BASE}?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search results from Wikipedia');
  }
  const data = await response.json();
  return data.query.search.map((item: any) => ({
      ...item,
      snippet: item.snippet.replace(/<[^>]*>/g, '') // strip html tags
  }));
};

export const getArticleHtml = async (title: string): Promise<string> => {
  const response = await fetch(`${WIKI_REST_BASE}${encodeURIComponent(title)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${title}`);
  }
  const html = await response.text();
  // The REST API wraps content in <html><body>...</body></html>, we only want the inner content.
  const bodyContentMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  return bodyContentMatch ? bodyContentMatch[1] : html;
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
  
    const response = await fetch(`${WIKI_API_BASE}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch article metadata from Wikipedia');
    }
    const data = await response.json();
    const pages = data.query.pages;
    return Object.values(pages) as ArticleMetadata[];
  };