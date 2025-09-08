# Wiki Compiler

A premium knowledge management and research environment designed to curate, customize, and consume knowledge from Wikipedia. Transform passive reading into an active, creative act of knowledge assembly.

## Key Features

- **Powerful Search**: Instantly search and browse Wikipedia articles from within the app.
- **Project-Based Organization**: Group related articles into "Compilations" to structure your research projects.
- **AI Research Assistant**: Leverage the power of Google's Gemini API to get instant insights on any article, including:
    - Concise summaries
    - Key concepts with explanations
    - Potential research questions to explore
    - Estimated reading time
- **Offline Article Archive**: Every article you view is automatically cached locally, creating a personal, searchable knowledge base that works offline.
- **Customizable PDF Exports**: Generate beautifully formatted PDF documents from your compilations with extensive customization options:
    - Paper size (A4, Letter) and layout (single/two-column)
    - Margins, line spacing, and font pairings (Modern & Classic)
    - Custom headers and footers (e.g., page numbers, custom text)
- **Markdown Export**: Export your entire compilation as a clean, single Markdown file.
- **Automatic Bibliography**: Automatically generate a formatted bibliography in either APA or MLA style for your exported documents.
- **Personalization**: Customize the app's appearance with Light/Dark themes and multiple accent colors.
- **Data Portability**: Backup and restore all your projects, cached articles, and settings with a simple import/export feature.
- **Command Palette**: A quick, keyboard-driven interface (Ctrl/Cmd + K) to navigate the app and execute commands.

## How to Use

### 1. The Library
This is your starting point.
- Use the search bar to find Wikipedia articles.
- Click on an article in the results list to preview it.
- Use the **"Analyze with AI"** button to get a quick summary and key insights.
- Click **"Add to Compilation"** to add the current article to your project.

### 2. The Compiler
This is where you build your document.
- **Organize Articles**: Drag and drop articles to reorder them in your compilation. You can also use `Ctrl/Cmd + Arrow Keys`.
- **Customize Settings**: Use the "Settings & Export" pane to fine-tune the appearance of your final PDF document.
- **Export**: Once you're ready, click **"Generate PDF"** or **"Export Markdown"** to create your final document.
- **Save Defaults**: You can save your current export settings as the new default for all future projects.

### 3. The Archive
This view contains a list of every article you have ever opened, stored locally in your browser. It acts as your personal research history and offline knowledge base. You can search the archive and add articles from it to your current compilation.

### 4. Settings
In the Settings view, you can:
- Change the app's theme and accent color.
- Configure the AI Research Assistant.
- Set default export options for the Compiler.
- Manage your local data, including clearing the cache or exporting/importing all your data.

## Technical Details

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **Local Storage**: IndexedDB (via `idb` library)
- **AI Integration**: Google Gemini API (`@google/genai`)

### AI Feature Configuration

To enable the AI Research Assistant features, you must have a valid Google Gemini API key. This key must be available as an environment variable named `API_KEY` in the execution environment. The application will automatically pick it up. Without this key, the AI-related features will be disabled.
