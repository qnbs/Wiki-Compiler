import React, { memo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Focus from '@tiptap/extension-focus';

interface ArticleEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  editable: boolean;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ content, onUpdate, editable }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Article content appears here...',
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
  }, [content, editable]); // Re-initialize editor if content or editable prop changes

  return (
      <div className="prose dark:prose-invert max-w-none focus-within:ring-2 focus-within:ring-accent-500 rounded-md -m-2">
        <EditorContent editor={editor} className="p-2" />
      </div>
  );
};

export default memo(ArticleEditor);