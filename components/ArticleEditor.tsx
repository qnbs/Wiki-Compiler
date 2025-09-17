import React, { memo, useEffect, useRef, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, EditorState, LexicalEditor } from 'lexical';

import { editorTheme } from './lexical/EditorTheme';
import { editorNodes } from './lexical/nodes';
import EditorBubbleMenu from './EditorBubbleMenu';
import EditorToolbar from './EditorToolbar';
import { isAiConfigured } from '../services/geminiService';
import { useTranslation } from 'react-i18next';

// Plugin to load initial HTML content
const HtmlPlugin: React.FC<{ html: string }> = ({ html }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().clear();
      $getRoot().select();
      $insertNodes(nodes);
    });
  }, [html, editor]);
  return null;
};

// Plugin to pass the editor instance to the parent
const EditorRefPlugin: React.FC<{ onEditorCreated: (editor: LexicalEditor | null) => void }> = ({ onEditorCreated }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    onEditorCreated(editor);
    return () => {
      onEditorCreated(null);
    };
  }, [editor, onEditorCreated]);
  return null;
};

interface ArticleEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  editable: boolean;
  onEditorCreated: (editor: LexicalEditor | null) => void;
  onAiEditClick: () => void;
  placeholder?: string;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ content, onUpdate, editable, onEditorCreated, onAiEditClick, placeholder }) => {
    const { t } = useTranslation();
    const timeoutRef = useRef<number | null>(null);

    const initialConfig = {
        namespace: 'ArticleEditor',
        theme: editorTheme,
        onError(error: Error) {
            throw error;
        },
        nodes: editorNodes,
        editable: editable,
    };
    
    // Debounce the onUpdate callback to improve performance
    const handleOnChange = useCallback((editorState: EditorState, editor: LexicalEditor) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            editor.getEditorState().read(() => {
                const htmlString = $generateHtmlFromNodes(editor, null);
                onUpdate(htmlString);
            });
        }, 500);
    }, [onUpdate]);

    const aiEnabled = isAiConfigured;
    const aiDisabledTooltip = !aiEnabled ? t('Invalid or missing API Key for Gemini. Please check your configuration.') : undefined;

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="prose dark:prose-invert max-w-none rounded-md -m-2 relative border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
                <EditorToolbar />
                <div className="relative p-2">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-input" />}
                        placeholder={<div className="editor-placeholder">{placeholder || 'Article content appears here...'}</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
                <HistoryPlugin />
                <ListPlugin />
                <LinkPlugin />
                <OnChangePlugin onChange={handleOnChange} />
                <HtmlPlugin html={content} />
                <EditorRefPlugin onEditorCreated={onEditorCreated} />
                <EditorBubbleMenu 
                    onAiEditClick={onAiEditClick}
                    isAiEnabled={aiEnabled}
                    aiDisabledTooltip={aiDisabledTooltip}
                />
            </div>
        </LexicalComposer>
    );
};

export default memo(ArticleEditor);