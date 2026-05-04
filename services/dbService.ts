import { openDB, type IDBPDatabase } from 'idb';
import { parseBackupJson } from './backupSchema';

const DB_NAME = 'WikiCompilerDB';
const DB_VERSION = 4; // Incremented version
const PROJECTS_STORE = 'projects';
const ARTICLES_STORE = 'articles';
const SETTINGS_STORE = 'settings';
const PROJECT_ARTICLES_STORE = 'project-articles';
const IMPORTED_IMAGES_STORE = 'importedImages';
const SETTINGS_KEY = 'app-settings';

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
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
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(PROJECT_ARTICLES_STORE)) {
          db.createObjectStore(PROJECT_ARTICLES_STORE, { keyPath: 'id' });
        }
      }
      if (oldVersion < 4) {
        if (!db.objectStoreNames.contains(IMPORTED_IMAGES_STORE)) {
          db.createObjectStore(IMPORTED_IMAGES_STORE, { keyPath: 'id' });
        }
      }
    },
  });
  }
  return dbPromise as Promise<IDBPDatabase>;
};

// Project Functions
export const getProjects = async () => {
  const db = await initDB();
  return db.getAll(PROJECTS_STORE);
};

export const saveProject = async (project) => {
  const db = await initDB();
  await db.put(PROJECTS_STORE, project);
};

export const deleteProject = async (projectId) => {
    const db = await initDB();
    await db.delete(PROJECTS_STORE, projectId);
};

// Article Cache Functions
export const getArticleCache = async (title) => {
  const db = await initDB();
  const article = await db.get(ARTICLES_STORE, title);
  return article || null;
};

export const getAllArticles = async () => {
    const db = await initDB();
    return db.getAll(ARTICLES_STORE);
};

export const saveArticleCache = async (article) => {
  const db = await initDB();
  await db.put(ARTICLES_STORE, article);
};

export const deleteArticleFromCache = async (title) => {
    const db = await initDB();
    await db.delete(ARTICLES_STORE, title);
};

export const clearArticleCache = async () => {
    const db = await initDB();
    await db.clear(ARTICLES_STORE);
};

export const getCacheSize = async () => {
    const db = await initDB();
    const articles = await db.getAll(ARTICLES_STORE);
    const count = articles.length;
    const size = articles.reduce((acc, article) => {
        return acc + (new Blob([article.html]).size);
    }, 0);
    return { count, size };
}


// Settings Functions
export const getSettings = async () => {
    const db = await initDB();
    return db.get(SETTINGS_STORE, SETTINGS_KEY);
};

export const saveSettings = async (settings) => {
    const db = await initDB();
    await db.put(SETTINGS_STORE, settings, SETTINGS_KEY);
};

// Project-specific Article Content Functions
export const getProjectArticleContent = async (projectId, title) => {
    const db = await initDB();
    const id = `${projectId}-${title}`;
    const content = await db.get(PROJECT_ARTICLES_STORE, id);
    return content || null;
};

export const saveProjectArticleContent = async (content) => {
    const db = await initDB();
    await db.put(PROJECT_ARTICLES_STORE, content);
};

// Image Importer Functions
export const getImportedImages = async () => {
    const db = await initDB();
    return db.getAll(IMPORTED_IMAGES_STORE);
};

export const saveImportedImage = async (image) => {
    const db = await initDB();
    await db.put(IMPORTED_IMAGES_STORE, image);
};

export const deleteImportedImage = async (id) => {
    const db = await initDB();
    await db.delete(IMPORTED_IMAGES_STORE, id);
};

// Data Management Functions
export const exportAllData = async () => {
    const db = await initDB();
    const projects = await db.getAll(PROJECTS_STORE);
    const articles = await db.getAll(ARTICLES_STORE);
    const settings = await db.get(SETTINGS_STORE, SETTINGS_KEY);
    const projectArticles = await db.getAll(PROJECT_ARTICLES_STORE);
    const importedImages = await db.getAll(IMPORTED_IMAGES_STORE);

    const data = {
        version: DB_VERSION,
        exportedAt: new Date().toISOString(),
        data: {
            projects,
            articles,
            settings,
            projectArticles,
            importedImages,
        }
    };

    return JSON.stringify(data, null, 2);
};

export const importAllData = async (jsonString, createBackup = true) => {
    if (createBackup) {
        try {
            const backupData = await exportAllData();
            sessionStorage.setItem('wiki-compiler-backup', backupData);
        } catch (e) {
            console.error("Failed to create pre-import backup:", e);
        }
    }
    
    const parsed = parseBackupJson(jsonString);
    const { projects, articles, settings, projectArticles, importedImages } = parsed.data;

    const db = await initDB();

    const storesToClear = [PROJECTS_STORE, ARTICLES_STORE, PROJECT_ARTICLES_STORE, IMPORTED_IMAGES_STORE];
    for(const storeName of storesToClear) {
        const tx = db.transaction(storeName, 'readwrite');
        await tx.store.clear();
        await tx.done;
    }

    const projectTx = db.transaction(PROJECTS_STORE, 'readwrite');
    for (const project of projects) {
        await projectTx.store.put(project);
    }
    await projectTx.done;
    
    const articleTx = db.transaction(ARTICLES_STORE, 'readwrite');
    for (const article of articles) {
        await articleTx.store.put(article);
    }
    await articleTx.done;

    if (projectArticles?.length) {
        const projectArticleTx = db.transaction(PROJECT_ARTICLES_STORE, 'readwrite');
        for (const pa of projectArticles) {
            await projectArticleTx.store.put(pa);
        }
        await projectArticleTx.done;
    }

    if (importedImages?.length) {
        const imageTx = db.transaction(IMPORTED_IMAGES_STORE, 'readwrite');
        for (const image of importedImages) {
            await imageTx.store.put(image);
        }
        await imageTx.done;
    }
    
    if (settings) {
        await saveSettings(settings);
    }
};
