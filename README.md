# Wiki Compiler

A premium knowledge management and research environment designed to curate, customize, and consume knowledge from Wikipedia. Transform passive reading into an active, creative act of knowledge assembly.

[English](#english) | [Deutsch](#deutsch)

---

<a name="english"></a>
## English

### Table of Contents
1.  [Introduction](#introduction)
2.  [Core Features](#core-features)
3.  [Experimenting with Prompts in Google AI Studio](#experimenting-with-prompts-in-google-ai-studio)
4.  [Getting Started: A Workflow Example](#getting-started-a-workflow-example)
5.  [Tech Stack](#tech-stack)

### Introduction
Wiki Compiler is a powerful tool for researchers, students, and lifelong learners who want to do more than just read Wikipedia. It allows you to collect articles, organize them into custom compilations, and generate professional-grade documents for offline use, study, or sharing. With an integrated AI Research Assistant, you can instantly distill complex topics into summaries, key concepts, and new research questions, turning raw information into structured knowledge.

### Core Features
*   **Powerful Search & Library**: Quickly find any article on Wikipedia and preview it in a clean, readable format.
*   **Project-Based Curation**: Create multiple projects to organize your research. Add articles from the library to a project with a single click.
*   **AI Research Assistant**: Powered by the Gemini API, this feature analyzes any article to provide:
    *   Concise summaries of long articles.
    *   A list of key concepts with brief explanations.
    *   Suggested research questions to spark further inquiry.
    *   An estimated reading time to help manage your workflow.
*   **Offline-First Architecture**:
    *   **Article Archive**: All viewed articles are automatically stored locally in your browser's IndexedDB, creating a personal, offline-accessible archive of your research.
    *   **Full Offline Functionality**: Search your archive, manage compilations, and read articles even without an internet connection.
*   **Advanced PDF & Markdown Export**:
    *   **Professional PDF Generation**: Create beautifully formatted PDFs with deep customization:
        *   **Layout**: Choose Letter or A4 paper sizes and single or two-column layouts.
        *   **Page Setup**: Control margins (normal, narrow, wide), line spacing, and add custom text to headers and footers.
        *   **Typography**: Select between modern (sans-serif) and classic (serif) font pairings, and fine-tune the base font size with a slider.
        *   **Content**: Automatically generate a clickable Table of Contents and a formatted Bibliography in APA or MLA style.
    *   **Flexible Markdown Export**: Export your entire compilation as a clean, structured Markdown file, perfect for use in other editors like Obsidian, Notion, or for version control with Git.
*   **Accessible & Intuitive UI**:
    *   **Drag-and-Drop & Button Controls**: Reorder articles in your compilation easily with a mouse or with fully accessible "Move Up/Down" buttons for keyboard and screen reader users.
    *   **Command Palette**: A quick-access tool (`Ctrl+K` or `⌘K`) to navigate the app and execute commands instantly.
    *   **Responsive Design**: A seamless experience on both desktop and mobile, with a dedicated bottom navigation bar for smaller screens.
*   **Personalization & Data Management**:
    *   **Customizable Appearance**: Tailor the interface with light/dark/system themes and multiple accent colors.
    *   **Full Data Portability**: Export and import all your projects, settings, and cached articles in a single JSON file for easy backups or migration.

### Experimenting with Prompts in Google AI Studio
The "AI Research Assistant" in Wiki Compiler uses Google's powerful Gemini models to generate insights. The logic for this is defined by a "prompt"—a set of instructions given to the AI.

We believe in transparency and customizability. That's why we've made the exact prompt used in this application available for you to explore and modify in **Google AI Studio**.

**What is Google AI Studio?**
Google AI Studio is a web-based tool that lets you quickly develop prompts and then get an API key to use them in your apps. You can run prompts for different modalities (text, image, audio, video) and tune them for the specific output you need.

**How to Use It:**
By following the link below, you can see how we instruct the AI to extract summaries, key concepts, and research questions. You can:
*   **Analyze the Prompt**: Understand the techniques used to get structured JSON output from the model.
*   **Modify It**: Change the instructions to better suit your research needs. For example, you could ask the AI to analyze articles from a specific viewpoint (e.g., "as a sociologist") or extract different types of information.
*   **Test It**: Input your own text and see how your modified prompt changes the AI's response in real-time.

This is a fantastic way to learn about prompt engineering and tailor the AI's power to your exact needs.

**[Explore the Wiki Compiler Prompt in Google AI Studio](https://ai.studio/apps/drive/1yyz5W0rD85UmlKj6X2vkwrX-SGMrQQmZ)**

### Getting Started: A Workflow Example
1.  **Create a Project**: Go to the project selector in the header and click "Create New Project". Give your research a name (e.g., "History of Computing").
2.  **Research in the Library**: Use the search bar in the **Library** view to find articles. As you click on results, you'll see a preview. Every article you view is automatically saved to your offline **Archive**.
3.  **Analyze & Curate**: For a complex article, use the "Analyze with AI" button to get a quick summary. If the article is relevant, click "Add to Compilation" to add it to your active project.
4.  **Assemble in the Compiler**: Switch to the **Compiler** view. Here you'll see a list of all articles in your project. Drag and drop them (or use the arrow buttons) to create a logical flow for your document.
5.  **Customize & Export**: Click on an article to preview it. In the "Settings & Export" panel, fine-tune every aspect of your PDF—from paper size and fonts to custom headers and bibliography style.
6.  **Generate Your Document**: Once you're happy with the settings, click "Generate PDF" or "Export Markdown" to get your final, polished document.

### Tech Stack
*   **Frontend**: React, TypeScript, Tailwind CSS
*   **AI**: Google Gemini API via `@google/genai` SDK
*   **Offline Storage**: IndexedDB (via `idb` library)
*   **Internationalization**: `i18next`
*   **PDF Generation**: `html2pdf.js`
*   **Markdown Conversion**: `turndown`

---

<a name="deutsch"></a>
## Deutsch

### Inhaltsverzeichnis
1.  [Einführung](#einführung-de)
2.  [Hauptfunktionen](#hauptfunktionen-de)
3.  [Experimentieren mit Prompts im Google AI Studio](#experimentieren-mit-prompts-im-google-ai-studio-de)
4.  [Erste Schritte: Ein Workflow-Beispiel](#erste-schritte-ein-workflow-beispiel-de)
5.  [Technologie-Stack](#technologie-stack-de)

### Einführung
Der Wiki-Compiler ist ein leistungsstarkes Werkzeug für Forschende, Studierende und lebenslang Lernende, die mehr tun möchten, als nur Wikipedia zu lesen. Er ermöglicht es Ihnen, Artikel zu sammeln, sie in benutzerdefinierten Kompilationen zu organisieren und professionelle Dokumente für die Offline-Nutzung, zum Lernen oder zum Teilen zu erstellen. Mit dem integrierten KI-Forschungsassistenten können Sie komplexe Themen sofort in Zusammenfassungen, Schlüsselkonzepte und neue Forschungsfragen destillieren und so aus rohen Informationen strukturiertes Wissen machen.

### Hauptfunktionen
*   **Leistungsstarke Bibliothek & Suche**: Finden Sie schnell jeden Artikel auf Wikipedia und sehen Sie ihn in einem sauberen, lesbaren Format in der Vorschau an.
*   **Projektbasierte Kuration**: Erstellen Sie mehrere Projekte, um Ihre Forschung zu organisieren. Fügen Sie Artikel mit einem einzigen Klick aus der Bibliothek zu einem Projekt hinzu.
*   **KI-Forschungsassistent**: Angetrieben durch die Gemini-API, analysiert diese Funktion jeden Artikel und liefert:
    *   Prägnante Zusammenfassungen langer Artikel.
    *   Eine Liste von Schlüsselkonzepten mit kurzen Erklärungen.
    *   Vorgeschlagene Forschungsfragen, um weitere Nachforschungen anzuregen.
    *   Eine geschätzte Lesezeit zur besseren Planung Ihres Workflows.
*   **Offline-First-Architektur**:
    *   **Artikel-Archiv**: Alle angesehenen Artikel werden automatisch lokal im IndexedDB Ihres Browsers gespeichert, wodurch ein persönliches, offline zugängliches Archiv Ihrer Recherchen entsteht.
    *   **Volle Offline-Funktionalität**: Durchsuchen Sie Ihr Archiv, verwalten Sie Kompilationen und lesen Sie Artikel auch ohne Internetverbindung.
*   **Erweiterter PDF- & Markdown-Export**:
    *   **Professionelle PDF-Generierung**: Erstellen Sie wunderschön formatierte PDFs mit umfassenden Anpassungsmöglichkeiten:
        *   **Layout**: Wählen Sie zwischen den Papierformaten Letter oder A4 und ein- oder zweispaltigen Layouts.
        *   **Seite einrichten**: Steuern Sie Seitenränder (normal, schmal, breit), den Zeilenabstand und fügen Sie benutzerdefinierten Text in Kopf- und Fußzeilen ein.
        *   **Typografie**: Wählen Sie zwischen modernen (sans-serif) und klassischen (serif) Schriftpaaren und passen Sie die Grundschriftgröße mit einem Schieberegler an.
        *   **Inhalt**: Generieren Sie automatisch ein klickbares Inhaltsverzeichnis und ein formatiertes Literaturverzeichnis im APA- oder MLA-Stil.
    *   **Flexibler Markdown-Export**: Exportieren Sie Ihre gesamte Kompilation als saubere, strukturierte Markdown-Datei, perfekt für die Verwendung in anderen Editoren wie Obsidian, Notion oder zur Versionskontrolle mit Git.
*   **Barrierefreie & Intuitive Benutzeroberfläche**:
    *   **Drag-and-Drop & Button-Steuerung**: Ordnen Sie Artikel in Ihrer Kompilation einfach mit der Maus oder mit vollständig barrierefreien "Nach oben/unten"-Schaltflächen für Tastatur- und Screenreader-Benutzer neu an.
    *   **Befehlspalette**: Ein Schnellzugriffswerkzeug (`Ctrl+K` oder `⌘K`), um in der App zu navigieren und Befehle sofort auszuführen.
    *   **Responsives Design**: Ein nahtloses Erlebnis auf dem Desktop und auf Mobilgeräten, mit einer dedizierten unteren Navigationsleiste für kleinere Bildschirme.
*   **Personalisierung & Datenmanagement**:
    *   **Anpassbares Erscheinungsbild**: Passen Sie die Benutzeroberfläche mit Hell-/Dunkel-/System-Themes und mehreren Akzentfarben an.
    *   **Volle Datenportabilität**: Exportieren und importieren Sie all Ihre Projekte, Einstellungen und zwischengespeicherten Artikel in einer einzigen JSON-Datei für einfache Backups oder Migration.

### Experimentieren mit Prompts im Google AI Studio
Der "KI-Forschungsassistent" im Wiki-Compiler verwendet die leistungsstarken Gemini-Modelle von Google, um Einblicke zu generieren. Die Logik dafür wird durch einen "Prompt" definiert – eine Reihe von Anweisungen, die der KI gegeben werden.

Wir glauben an Transparenz und Anpassbarkeit. Deshalb haben wir den genauen Prompt, der in dieser Anwendung verwendet wird, für Sie zur Verfügung gestellt, damit Sie ihn im **Google AI Studio** erkunden und ändern können.

**Was ist Google AI Studio?**
Google AI Studio ist ein webbasiertes Werkzeug, mit dem Sie schnell Prompts entwickeln und dann einen API-Schlüssel erhalten können, um sie in Ihren Apps zu verwenden. Sie können Prompts für verschiedene Modalitäten (Text, Bild, Audio, Video) ausführen und sie für die spezifische Ausgabe, die Sie benötigen, optimieren.

**Wie man es benutzt:**
Über den untenstehenden Link können Sie sehen, wie wir die KI anweisen, Zusammenfassungen, Schlüsselkonzepte und Forschungsfragen zu extrahieren. Sie können:
*   **Den Prompt analysieren**: Verstehen Sie die Techniken, die verwendet werden, um eine strukturierte JSON-Ausgabe vom Modell zu erhalten.
*   **Ihn modifizieren**: Ändern Sie die Anweisungen, um sie besser an Ihre Forschungsbedürfnisse anzupassen. Sie könnten die KI zum Beispiel bitten, Artikel aus einer bestimmten Perspektive zu analysieren (z. B. "als Soziologe") oder andere Arten von Informationen zu extrahieren.
*   **Ihn testen**: Geben Sie Ihren eigenen Text ein und sehen Sie in Echtzeit, wie Ihr modifizierter Prompt die Antwort der KI verändert.

Dies ist eine fantastische Möglichkeit, mehr über Prompt-Engineering zu lernen und die Leistungsfähigkeit der KI genau auf Ihre Bedürfnisse zuzuschneiden.

**[Erkunden Sie den Wiki-Compiler-Prompt im Google AI Studio](https://ai.studio/apps/drive/1yyz5W0rD85UmlKj6X2vkwrX-SGMrQQmZ)**

### Erste Schritte: Ein Workflow-Beispiel
1.  **Projekt erstellen**: Gehen Sie zur Projektauswahl in der Kopfzeile und klicken Sie auf "Neues Projekt erstellen". Geben Sie Ihrer Forschung einen Namen (z. B. "Geschichte der Informatik").
2.  **Recherche in der Bibliothek**: Verwenden Sie die Suchleiste in der **Bibliotheksansicht**, um Artikel zu finden. Wenn Sie auf Ergebnisse klicken, sehen Sie eine Vorschau. Jeder Artikel, den Sie ansehen, wird automatisch in Ihrem Offline-**Archiv** gespeichert.
3.  **Analysieren & Kuratieren**: Bei einem komplexen Artikel verwenden Sie die Schaltfläche "Mit KI analysieren", um eine schnelle Zusammenfassung zu erhalten. Wenn der Artikel relevant ist, klicken Sie auf "Zur Kompilation hinzufügen", um ihn Ihrem aktiven Projekt hinzuzufügen.
4.  **Zusammenstellen im Compiler**: Wechseln Sie zur **Compiler-Ansicht**. Hier sehen Sie eine Liste aller Artikel in Ihrem Projekt. Ziehen und verschieben Sie sie (oder verwenden Sie die Pfeiltasten), um einen logischen Fluss für Ihr Dokument zu erstellen.
5.  **Anpassen & Exportieren**: Klicken Sie auf einen Artikel, um eine Vorschau anzuzeigen. Im Panel "Einstellungen & Export" passen Sie jeden Aspekt Ihres PDFs an – von Papiergröße und Schriftarten bis hin zu benutzerdefinierten Kopfzeilen und dem Bibliografiestil.
6.  **Dokument generieren**: Sobald Sie mit den Einstellungen zufrieden sind, klicken Sie auf "PDF erstellen" oder "Markdown exportieren", um Ihr endgültiges, poliertes Dokument zu erhalten.

### Technologie-Stack
*   **Frontend**: React, TypeScript, Tailwind CSS
*   **KI**: Google Gemini API über `@google/genai` SDK
*   **Offline-Speicher**: IndexedDB (über die `idb`-Bibliothek)
*   **Internationalisierung**: `i18next`
*   **PDF-Generierung**: `html2pdf.js`
*   **Markdown-Konvertierung**: `turndown`
