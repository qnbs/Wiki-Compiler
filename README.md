# Wiki Compiler

*Eine Premium-Wissensmanagement- und Forschungsumgebung, um Wissen aus Wikipedia zu kuratieren, anzupassen und zu kompilieren.*

Verwandeln Sie passives Lesen in einen aktiven, kreativen Akt der Wissenszusammenstellung. Wiki Compiler ist Ihr dedizierter Raum, um Themen zu recherchieren, Artikel zu sammeln, KI-gestützte Einblicke zu gewinnen und wunderschön formatierte Dokumente für Studium, Präsentation oder Verteilung zu veröffentlichen.

---

## Kernphilosophie

Im Zeitalter der Informationsüberflutung bietet Wiki Compiler einen fokussierten Zufluchtsort für konzentriertes Arbeiten. Durch die Kombination eines leistungsstarken Wikipedia-Clients mit einem projektbasierten Compiler wird der gesamte Arbeitsablauf von der Forschung bis zur Veröffentlichung optimiert. Unser Ziel ist es, Studierende, Forschende und lebenslang Lernende zu befähigen, Wissen effektiver aufzubauen und zu teilen.

---

## Hauptfunktionen

### 🧠 Wissenskuratierung & -management
*   **Projektbasierte Organisation**: Gruppieren Sie zusammengehörige Artikel in "Kompilationen", um Ihre Forschungsprojekte zu strukturieren.
*   **Leistungsstarke Suche**: Suchen und durchsuchen Sie Wikipedia-Artikel sofort mit erweiterten Sortieroptionen.
*   **Offline-Artikelarchiv**: Jeder Artikel, den Sie ansehen, wird automatisch lokal zwischengespeichert und schafft so eine persönliche, durchsuchbare Wissensdatenbank, die jederzeit und überall funktioniert.
*   **Direkte Inhaltsbearbeitung**: Ändern Sie den Artikeltext direkt im Compiler, um den Inhalt für Ihr spezifisches Projekt anzupassen. Änderungen werden pro Projekt gespeichert.

### ✨ KI-gestützter Forschungsassistent
*   **Sofortige Einblicke**: Nutzen Sie die Gemini-API von Google, um eine intelligente Aufschlüsselung jedes Artikels zu erhalten.
*   **Gezielte Analyse**: Wählen Sie in den Einstellungen aus, ob Sie eine Zusammenfassung, Schlüsselkonzepte, Forschungsfragen oder eine beliebige Kombination davon generieren möchten, um die KI-Ausgabe zu optimieren.
*   **Schlüsselkonzepte**: Identifizieren und erklären Sie automatisch wichtige Begriffe, Personen und Orte.
*   **Forschungssprungbrett**: Entdecken Sie potenzielle Forschungsfragen, um Ihr Studium und Ihre Erkundung zu leiten.

### 📚 Professionelles Publizieren & Export
*   **Erweitertes Zitatmanagement**: Fügen Sie benutzerdefinierte externe Quellen (Bücher, Websites usw.) hinzu, verwalten Sie sie und fügen Sie sie als In-Text-Zitate in Ihre Artikel ein.
*   **Anpassbare PDF-Exporte**: Erstellen Sie ausgefeilte PDF-Dokumente aus Ihren Kompilationen mit umfangreichen Formatierungssteuerungen.
    *   **Layout**: Papierformate A4/Letter, ein- oder zweispaltige Layouts.
    *   **Typografie**: Moderne (Sans-Serif) & klassische (Serif) Schriftart-Paarungen mit anpassbarer Basisschriftgröße und Zeilenabstand.
    *   **Seiteneinrichtung**: Feinabstimmung der Ränder und Hinzufügen von benutzerdefinierten Kopf- und Fußzeilen (Seitenzahlen, Titel usw.).
*   **Automatische Bibliografie**: Generieren Sie automatisch eine formatierte Bibliografie im **APA**- oder **MLA**-Stil, die sowohl Wikipedia-Artikel als auch Ihre benutzerdefinierten Zitate enthält.
*   **Markdown-Export**: Exportieren Sie Ihre gesamte Kompilation als saubere, portable einzelne Markdown-Datei, komplett mit Links zu den ursprünglichen Quellartikeln.

### 🎨 Personalisierter & effizienter Workflow
*   **Fokussierter Dunkelmodus**: Ein schöner Dunkelmodus für konzentrierte, nächtliche Forschungssitzungen.
*   **Mehrsprachige Unterstützung**: Wechseln Sie zwischen Englisch und Deutsch für eine lokalisierte Erfahrung.
*   **Akzentfarben**: Personalisieren Sie die Benutzeroberfläche mit Ihrer bevorzugten Hervorhebungsfarbe.
*   **Befehlspalette**: Eine tastaturgesteuerte Oberfläche (**Ctrl/Cmd + K**), um sofort zwischen Ansichten zu navigieren und Befehle auszuführen.
*   **Datentransportierbarkeit**: Sichern und Wiederherstellen Sie Ihren gesamten Arbeitsbereich (Projekte, Artikel, Einstellungen) mit einem einfachen JSON-Import/Export.

---

## Technischer Stack

Diese Anwendung wurde mit einem modernen, client-zentrierten Technologie-Stack erstellt, der auf Leistung, Offline-Fähigkeit und eine reichhaltige Benutzererfahrung ausgelegt ist.

*   **Framework**: **React mit TypeScript** für eine robuste, typsichere und komponentenbasierte Benutzeroberfläche.
*   **Styling**: **Tailwind CSS** (über CDN) für schnelles, Utility-First-Styling, das ein konsistentes und modernes Designsystem ermöglicht.
*   **Client-seitiger Speicher**: **IndexedDB** (unter Verwendung der `idb`-Bibliothek) bietet eine große, asynchrone und persistente lokale Datenbank. Dies ist entscheidend für das Offline-Artikelarchiv, die Projektspeicherung und die Benutzereinstellungen und bietet deutlich mehr Kapazität und Leistung als `localStorage`.
*   **KI-Integration**: **Google Gemini API** (`@google/genai`) ist der Kern des KI-Forschungsassistenten und bietet leistungsstarke generative Fähigkeiten zur Inhaltszusammenfassung, Konzeptextraktion und Fragengenerierung.
*   **PDF-Generierung**: **`html2pdf.js`** läuft auf dem Client, um den kompilierten HTML-Inhalt in ein herunterladbares PDF zu konvertieren, was komplexe Layouts und Anpassungen ohne serverseitige Verarbeitung ermöglicht.
*   **HTML zu Markdown**: **`turndown`** wird verwendet, um den reichhaltigen HTML-Inhalt von Wikipedia-Artikeln für den Export in sauberes, lesbares Markdown zu konvertieren.
*   **Internationalisierung**: **`i18next`** und **`react-i18next`** werden verwendet, um vollständige Lokalisierungsunterstützung zu bieten und die Anwendung einem globalen Publikum zugänglich zu machen.

---

## Lokale Entwicklung & Setup

Dieses Projekt verwendet moderne Webfunktionen wie Import-Maps, sodass zum Ausführen kein `npm install` oder Build-Schritt erforderlich ist. Sie können es ausführen, indem Sie die Dateien mit einem beliebigen lokalen Webserver bereitstellen.

### Einrichten des Gemini API-Schlüssels

Um den KI-Forschungsassistenten zu aktivieren, ist ein gültiger Google Gemini API-Schlüssel erforderlich.

**1. Holen Sie sich Ihren API-Schlüssel:**
   - Besuchen Sie [Google AI Studio](https://aistudio.google.com/).
   - Klicken Sie auf **"Get API key"** und erstellen Sie einen neuen Schlüssel.

**2. Stellen Sie den API-Schlüssel bereit:**
   Die Anwendung ist so konzipiert, dass sie sicher auf den Schlüssel aus einer vorkonfigurierten Umgebungsvariable namens `API_KEY` zugreift. **Hardcodieren Sie Ihren Schlüssel nicht im Quellcode.**

   **Sicherheitswarnung**: Dies ist eine clientseitige Anwendung. Das Offenlegen eines API-Schlüssels im Browser ist für eine Produktionsanwendung unsicher, da er leicht kopiert werden kann. Für eine echte öffentliche Website sollten Sie einen Backend-Proxy erstellen, der den Schlüssel sicher aufbewahrt und Anfragen an die Google-API weiterleitet. Die folgenden Methoden eignen sich für den persönlichen Gebrauch, Portfolio-Projekte oder geschützte Deployments.

   **Für die lokale Entwicklung (VS Code):**
   - Der einfachste Weg ist die Verwendung einer Erweiterung wie **Live Server**.
   - Da Live Server keine Umgebungsvariablen injizieren kann, können Sie vorübergehend ein Skript-Tag in `index.html` nur für lokale Tests hinzufügen. **Denken Sie daran, es vor dem Commit zu entfernen!**
     ```html
     <!-- In index.html, innerhalb des <head>-Tags -->
     <script>
       // NUR FÜR LOKALE ENTWICKLUNG - NICHT COMMITEN
       window.process = { env: { API_KEY: 'IHR_API_SCHLÜSSEL_HIER' } };
     </script>
     ```

   **Für das Deployment (Vercel, Netlify, etc.):**
   - Diese Plattformen bieten eine sichere Möglichkeit, Umgebungsvariablen zu verwalten.
   - Gehen Sie zu den Einstellungen Ihres Projekts auf der Plattform (z.B. Vercel Dashboard > Project > Settings > Environment Variables).
   - Fügen Sie eine neue Umgebungsvariable hinzu:
     - **Name**: `API_KEY`
     - **Wert**: Fügen Sie Ihren Gemini-API-Schlüssel ein.
   - Die Plattform stellt diese Variable der Anwendung während des Build- und Bereitstellungsprozesses zur Verfügung, und die App wird korrekt funktionieren.

---

## Erstellt mit Google AI Studio

Diese Anwendung wurde mit **[Google AI Studio](https://ai.studio.google.com/)** entwickelt. AI Studio ist eine webbasierte IDE, die es Entwicklern ermöglicht, generative KI-Anwendungen schnell zu prototypisieren und zu erstellen. Es bietet einen optimierten Arbeitsablauf zum Iterieren von Prompts, zum Abstimmen von Modellen und zur Integration in den Anwendungscode.

Die Entwicklung von Wiki Compiler wurde durch die Funktionen von AI Studio erheblich beschleunigt, was die nahtlose Integration des Google Gemini-Modells für seine zentralen KI-Funktionen ermöglichte.