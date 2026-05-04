# Graph Report - Wiki-Compiler  (2026-05-04)

## Corpus Check
- 87 files · ~33,568 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 234 nodes · 243 edges · 12 communities detected
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 15|Community 15]]

## God Nodes (most connected - your core abstractions)
1. `initDB()` - 19 edges
2. `t()` - 11 edges
3. `LibraryProvider()` - 8 edges
4. `useSettings()` - 7 edges
5. `importAllData()` - 6 edges
6. `getHtmlContent()` - 6 edges
7. `useToasts()` - 5 edges
8. `ArchiveProvider()` - 5 edges
9. `CompilerView()` - 5 edges
10. `handleUpdate()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `useSettings()` --calls--> `LibraryView()`  [INFERRED]
  hooks/useSettingsContext.ts → components/LibraryView.tsx
- `useImporter()` --calls--> `LibraryProvider()`  [INFERRED]
  hooks/useImporterContext.ts → contexts/LibraryContext.tsx
- `loadContent()` --calls--> `getProjectArticleContent()`  [INFERRED]
  components/CompilerRightPanel.tsx → services/dbService.ts
- `handleArticleUpdate()` --calls--> `saveProjectArticleContent()`  [INFERRED]
  components/CompilerRightPanel.tsx → services/dbService.ts
- `fetchCacheInfo()` --calls--> `getCacheSize()`  [INFERRED]
  components/settings/StorageSettings.tsx → services/dbService.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (14): App(), ArchiveProvider(), CompilerView(), LibraryProvider(), LibraryView(), ProjectsProvider(), useArticleAnalysis(), useArticleCache() (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (20): parseBackupJson(), clearArticleCache(), deleteArticleFromCache(), deleteImportedImage(), deleteProject(), exportAllData(), getAllArticles(), getArticleCache() (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (11): ArticleEditor(), removeArticle(), handleAddAllToProject(), handleAddToProject(), fetchCacheInfo(), formatBytes(), handleClearCache(), handleExport() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (10): editTextWithAi(), getArticleInsights(), getProvider(), isAiConfigured(), handleArticleUpdate(), handleRunAiEdit(), loadContent(), DisabledAiProvider (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (14): formatBibliography(), generateDocx(), generateDocxBlob(), generateMarkdown(), generateOdt(), generateOdtBlob(), generateSingleArticleDocx(), generateSingleArticleOdt() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (2): GeminiAiProvider, mapAiError()

### Community 8 - "Community 8"
Cohesion: 0.52
Nodes (6): getArticleHtml(), getArticleMetadata(), getWikiApiBase(), getWikiBase(), getWikiRestBase(), searchArticles()

### Community 9 - "Community 9"
Cohesion: 0.53
Nodes (4): closeAllMenus(), handleCreateNewProject(), handleDropdownKeyDown(), handleRenameSubmit()

### Community 10 - "Community 10"
Cohesion: 0.53
Nodes (4): handleAdd(), handleDelete(), handleSave(), handleUpdate()

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (2): deepMerge(), isObject()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (2): SlideOverPanel(), useFocusTrap()

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (2): handleFocusChange(), handleNestedChange()

## Knowledge Gaps
- **Thin community `Community 6`** (8 nodes): `GeminiAiProvider`, `.constructor()`, `.editTextWithAi()`, `.getArticleInsights()`, `.isConfigured()`, `mapAiError()`, `geminiProvider.ts`, `mapAiError.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (4 nodes): `SettingsContext.tsx`, `deepMerge()`, `isObject()`, `SettingsProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (4 nodes): `SlideOverPanel.tsx`, `useFocusTrap.ts`, `SlideOverPanel()`, `useFocusTrap()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (3 nodes): `LibrarySettings.tsx`, `handleFocusChange()`, `handleNestedChange()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getHtmlContent()` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `getSettings()` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `t()` (e.g. with `handleAddToProject()` and `handleAddAllToProject()`) actually correct?**
  _`t()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `LibraryProvider()` (e.g. with `useSettings()` and `useProjects()`) actually correct?**
  _`LibraryProvider()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `useSettings()` (e.g. with `App()` and `useArticleAnalysis()`) actually correct?**
  _`useSettings()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `importAllData()` (e.g. with `handleRestore()` and `parseBackupJson()`) actually correct?**
  _`importAllData()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._