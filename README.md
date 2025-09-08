# Wiki Compiler

*A premium knowledge management environment to curate, customize, and compile knowledge from Wikipedia.*

Transform passive reading into an active, creative act of knowledge assembly. Wiki Compiler is your dedicated space to research topics, gather articles, gain AI-powered insights, and publish beautifully formatted documents for study, presentation, or distribution.

![Wiki Compiler Interface](https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/16-9-gemini-pro-1.gif) 
*(Image is a placeholder representation of a modern UI)*

---

## Core Philosophy

In an age of information overload, Wiki Compiler provides a focused sanctuary for deep work. By combining a powerful Wikipedia client with a project-based compiler, it streamlines the entire research-to-publication workflow. Our goal is to empower students, researchers, and lifelong learners to build and share knowledge more effectively.

---

## Key Features

### 🧠 Knowledge Curation & Management
*   **Project-Based Organization**: Group related articles into "Compilations" to structure your research projects.
*   **Powerful Search**: Instantly search and browse Wikipedia articles with advanced sorting options.
*   **Offline Article Archive**: Every article you view is automatically cached locally, creating a personal, searchable knowledge base that works anytime, anywhere.
*   **Seamless Organization**: Easily reorder articles via drag-and-drop or keyboard shortcuts.

### ✨ AI-Powered Research Assistant
*   **Instant Insights**: Leverage Google's Gemini API to get an intelligent breakdown of any article.
*   **Quick Summaries**: Understand the essence of an article in seconds with concise, AI-generated summaries.
*   **Key Concepts**: Automatically identify and explain key terms, people, and places.
*   **Research Springboard**: Discover potential research questions to guide your study and exploration.

### 📚 Professional Publishing & Export
*   **Customizable PDF Exports**: Generate polished PDF documents from your compilations with extensive formatting controls.
    *   **Layout**: A4/Letter paper sizes, single or two-column layouts.
    *   **Typography**: Modern (Sans-Serif) & Classic (Serif) font pairings with adjustable base font size and line spacing.
    *   **Page Setup**: Fine-tune margins, and add custom headers and footers (page numbers, titles, etc.).
*   **Automatic Bibliography**: Automatically generate a formatted bibliography in either **APA** or **MLA** style.
*   **Markdown Export**: Export your entire compilation as a clean, portable single Markdown file.

### 🎨 Personalized & Efficient Workflow
*   **Focused Dark Mode**: A beautiful dark mode for focused, late-night research sessions.
*   **Accent Colors**: Personalize the interface with your favorite highlight color.
*   **Command Palette**: A keyboard-driven interface (**Ctrl/Cmd + K**) to instantly navigate views and execute commands.
*   **Data Portability**: Backup and restore your entire workspace (projects, articles, settings) with a simple JSON import/export.

---

## A Typical Workflow

1.  **Research & Collect (Library)**: Start a new project and use the Library view to search for articles. As you find relevant content, use the AI Assistant to vet them and click "Add to Compilation" to gather your sources.
2.  **Organize & Refine (Compiler)**: Switch to the Compiler view. Here, you'll see all your collected articles. Drag and drop them into a logical order. Dive into the export settings to style your final document.
3.  **Publish & Share (Export)**: Once you're satisfied, click "Generate PDF" or "Export Markdown". Your professionally formatted document, complete with a table of contents and bibliography, is ready.
4.  **Build Your Knowledge Base (Archive)**: Over time, the Archive view becomes your personal, offline encyclopedia filled with every article you've ever explored.

---

## Built with Google AI Studio

This application was developed using **[Google AI Studio](https://ai.studio/apps/drive/1yyz5W0rD85UmlKj6X2vkwrX-SGMrQQmZ)**. AI Studio is a web-based IDE that allows developers to rapidly prototype and build generative AI applications. It provides a streamlined workflow for iterating on prompts, tuning models, and integrating them with application code.

The development of Wiki Compiler was significantly accelerated by AI Studio's capabilities, enabling the seamless integration of the Google Gemini model for its core AI features. You can explore a snapshot of the development process for this app directly in AI Studio via the link above.

---

## Technical Stack

*   **Framework**: React with TypeScript
*   **Styling**: Tailwind CSS (with JIT via CDN)
*   **State Management**: React Hooks (State, Context, Effects)
*   **Local Storage**: IndexedDB (via `idb` library for robust offline storage)
*   **AI Integration**: Google Gemini API (`@google/genai`)
*   **PDF Generation**: `html2pdf.js`
*   **HTML to Markdown**: `turndown`

### AI Feature Configuration

To enable the AI Research Assistant, a valid Google Gemini API key is required.

**IMPORTANT**: The API key **must** be provided as an environment variable named `API_KEY` in the execution environment. The application is designed to securely access this variable. For security reasons, there is no UI to enter the key directly. Without this key, AI-related features will be gracefully disabled.