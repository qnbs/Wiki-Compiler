import React, { memo, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Focus from '@tiptap/extension-focus';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { Editor } from '@tiptap/core';
import EditorBubbleMenu from './EditorBubbleMenu';
import { isAiConfigured } from '../services/geminiService';
import { useTranslation } from 'react-i18next';

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