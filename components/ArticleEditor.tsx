import React, { memo, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Focus from '@tiptap/extension-focus';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { Editor } from '@tiptap/core';
import EditorBubbleMenu from './EditorBubbleMenu';
import { isAiConfigured, editTextWithAi } from '../services/geminiService';
import { useTranslation } from 'react-i18next';
import { Suggestion } from '@tiptap/suggestion';
import AICommandList from './AICommandList';
import { useToasts } from '../hooks/useToasts';

interface ArticleEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  editable: boolean;
  onEditorCreated: (editor: Editor | null) => void;
  onAiEditClick: () => void;
  placeholder?: string;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ content, onUpdate, editable, onEditorCreated, onAiEditClick, placeholder }) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Article content appears here...',
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      BubbleMenu.configure({
        element: document.createElement('div'),
      }),
      Suggestion({
        char: '++',
        command: async ({ editor, range, props }) => {
            const { command, text } = props;
            
            const selection = editor.state.selection;
            const isSelectionEmpty = selection.from === selection.to;
            
            // The text to edit is either the current selection or the whole document content
            const textToEdit = isSelectionEmpty ? editor.getText() : editor.state.doc.textBetween(selection.from, selection.to);

            // Insert loading state
            editor.chain().focus().insertContentAt(range, `<p><em>${t('AI is thinking...')}</em></p>`).run();

            try {
                const finalPrompt = command.replace('selection', `the following text: "${textToEdit}"`);
                const result = await editTextWithAi(finalPrompt, textToEdit);
                
                // Find where the loading message was inserted and replace it
                const { from, to } = range;
                const docText = editor.getText();
                // We search from the original start of the command
                const loadingTextIndex = docText.indexOf(t('AI is thinking...'), from - 2);

                if (loadingTextIndex !== -1) {
                    const loadingTextEnd = loadingTextIndex + t('AI is thinking...').length;
                    
                    // If there was a selection, replace the original selection. Otherwise replace the whole doc.
                    if (isSelectionEmpty) {
                        editor.chain().focus().selectAll().deleteSelection().insertContent(result).run();
                    } else {
                        editor.chain().focus()
                          .setTextSelection({ from: selection.from, to: selection.to })
                          .deleteSelection()
                          .insertContentAt(selection.from, result)
                          .run();
                    }
                    // Clean up any stray loading messages if selection logic fails
                    const finalDocText = editor.getText();
                    const finalLoadingIndex = finalDocText.indexOf(t('AI is thinking...'));
                    if (finalLoadingIndex !== -1) {
                        editor.chain().focus().setTextSelection({from: finalLoadingIndex, to: finalLoadingIndex + t('AI is thinking...').length + 2}).deleteSelection().run();
                    }

                } else {
                    // Fallback if loading text is not found
                    editor.chain().focus().insertContentAt(range.from, result).run();
                }

            } catch (error) {
                console.error("AI command failed:", error);
                addToast(error instanceof Error ? error.message : "AI command failed", 'error');
                // Remove loading state on error
                const docText = editor.getText();
                const loadingTextIndex = docText.indexOf(t('AI is thinking...'));
                 if (loadingTextIndex !== -1) {
                    const loadingTextEnd = loadingTextIndex + t('AI is thinking...').length;
                    editor.chain().focus().setTextSelection({ from: loadingTextIndex, to: loadingTextEnd + 2}).deleteSelection().run();
                }
            }
        },
        items: ({ query }) => {
            const staticCommands = [
                { title: t('Summarize selection'), command: 'Summarize selection' },
                { title: t('Improve writing of selection'), command: 'Improve writing of selection' },
                { title: t('Fix spelling & grammar of selection'), command: 'Fix spelling & grammar of selection' },
            ];

            const filteredCommands = staticCommands.filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
            
            return [
                ...filteredCommands,
                { title: `${t('Ask AI... (press Enter)')}: ${query}`, command: query, isFreeform: true },
            ];
        },
        render: () => {
            let component: any; // AICommandList
            let popup: any;

            return {
                onStart: props => {
                    component = new AICommandList(props);
                    popup = component.element;
                },
                onUpdate(props) {
                    component.updateProps(props);
                },
                onKeyDown(props) {
                    return component.onKeyDown(props);
                },
                onExit() {
                    popup.remove();
                },
            };
        },
      }),
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      onEditorCreated(editor);
    }
    return () => {
        onEditorCreated(null);
    }
  }, [editor, onEditorCreated]);

  const aiEnabled = isAiConfigured;
  const aiDisabledTooltip = !isAiConfigured ? t('Invalid or missing API Key for Gemini. Please check your configuration.') : undefined;

  return (
      <div className="prose dark:prose-invert max-w-none focus-within:ring-2 focus-within:ring-accent-500 rounded-md -m-2 relative">
        <EditorBubbleMenu 
          editor={editor}
          onAiEditClick={onAiEditClick}
          isAiEnabled={aiEnabled}
          aiDisabledTooltip={aiDisabledTooltip}
        />
        <EditorContent editor={editor} className="p-2" />
      </div>
  );
};

export default memo(ArticleEditor);