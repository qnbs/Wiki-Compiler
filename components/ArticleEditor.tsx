import React, { memo, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Focus from '@tiptap/extension-focus';
import { Editor } from '@tiptap/core';

interface ArticleEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  editable: boolean;
  onEditorCreated: (editor: Editor) => void;
  placeholder?: string;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ content, onUpdate, editable, onEditorCreated, placeholder }) => {
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
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  }, [content, editable, placeholder]); // Re-initialize editor if content or editable prop changes

  // Fix: Pass the editor instance to the parent component once it's created.
  useEffect(() => {
    if (editor) {
      onEditorCreated(editor);
    }
  }, [editor, onEditorCreated]);

  return (
      <div className="prose dark:prose-invert max-w-none focus-within:ring-2 focus-within:ring-accent-500 rounded-md -m-2">
        <EditorContent editor={editor} className="p-2" />
      </div>
  );
};

export default memo(ArticleEditor);