import { openDB, IDBPDatabase } from 'idb';
import { Project, ArticleContent, AppSettings } from '../types';

const DB_NAME = 'WikiCompilerDB';
const DB_VERSION = 2; // Incremented version
const PROJECTS_STORE = 'projects';
const ARTICLES_STORE = 'articles';
const SETTINGS_STORE = 'settings';
const SETTINGS_KEY = 'app-settings';

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = () => {
  if (dbPromise) return dbPromise;
  
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ARTICLES_STORE)) {
        db.createObjectStore(ARTICLES_STORE, { keyPath: 'title' });
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
            db.createObjectStore(SETTINGS_STORE);
        }
      }
    },
  });
  return dbPromise;
};

// Project Functions
export const getProjects = async (): Promise<Project[]> => {
  const db = await initDB();
  return db.getAll(PROJECTS_STORE);
};

export const saveProject = async (project: Project): Promise<void> => {
  const db = await initDB();
  await db.put(PROJECTS_STORE, project);
};

export const deleteProject = async (projectId: string): Promise<void> => {
    const db = await initDB();
    await db.delete(PROJECTS_STORE, projectId);
};

// Article Cache Functions
export const getArticleCache = async (title: string): Promise<string | null> => {
  const db = await initDB();
  const article = await db.get(ARTICLES_STORE, title);
  return article ? article.html : null;
};

export const getAllArticles = async (): Promise<ArticleContent[]> => {
    const db = await initDB();
    return db.getAll(ARTICLES_STORE);
};

export const saveArticleCache = async (article: ArticleContent): Promise<void> => {
  const db = await initDB();
  await db.put(ARTICLES_STORE, article);
};

export const deleteArticleFromCache = async (title: string): Promise<void> => {
    const db = await initDB();
    await db.delete(ARTICLES_STORE, title);
};

export const clearArticleCache = async (): Promise<void> => {
    const db = await initDB();
    await db.clear(ARTICLES_STORE);
};

export const getCacheSize = async (): Promise<{count: number, size: number}> => {
    const db = await initDB();
    const articles = await db.getAll(ARTICLES_STORE);
    const count = articles.length;
    const size = articles.reduce((acc, article) => {
        return acc + (new Blob([article.html]).size);
    }, 0);
    return { count, size };
}


// Settings Functions
export const getSettings = async (): Promise<AppSettings | null> => {
    const db = await initDB();
    return db.get(SETTINGS_STORE, SETTINGS_KEY);
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
    const db = await initDB();
    await db.put(SETTINGS_STORE, settings, SETTINGS_KEY);
};


// Data Management Functions
export const exportAllData = async (): Promise<string> => {
    const db = await initDB();
    const projects = await db.getAll(PROJECTS_STORE);
    const articles = await db.getAll(ARTICLES_STORE);
    const settings = await db.get(SETTINGS_STORE, SETTINGS_KEY);

    const data = {
        version: DB_VERSION,
        exportedAt: new Date().toISOString(),
        data: {
            projects,
            articles,
            settings,
        }
    };

    return JSON.stringify(data, null, 2);
};

export const importAllData = async (jsonString: string): Promise<void> => {
    const importData = JSON.parse(jsonString);
    if (!importData.data) throw new Error("Invalid import file format");
    const { projects, articles, settings } = importData.data;

    const db = await initDB();

    const projectTx = db.transaction(PROJECTS_STORE, 'readwrite');
    await projectTx.store.clear();
    for (const project of projects) {
        await projectTx.store.add(project);
    }
    await projectTx.done;
    
    const articleTx = db.transaction(ARTICLES_STORE, 'readwrite');
    await articleTx.store.clear();
    for (const article of articles) {
        await articleTx.store.add(article);
    }
    await articleTx.done;
    
    if (settings) {
        await saveSettings(settings);
    }
};