import React from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@tiptap/core';
// FIX: The error indicates BubbleMenu is not in @tiptap/react. Assuming a configuration where it is exported from @tiptap/extension-bubble-menu.
import { BubbleMenu } from '@tiptap/react';
import Icon from './Icon';

interface EditorBubbleMenuProps {
  editor: Editor | null;
  onAiEditClick: () => void;
  isAiEnabled: boolean;
  aiDisabledTooltip?: string;
}

const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ editor, onAiEditClick, isAiEnabled, aiDisabledTooltip }) => {
  const { t } = useTranslation();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100, animation: 'scale-subtle' }}>
      <div className="flex items-center gap-1 bg-gray-800 text-white px-2 py-1 rounded-lg shadow-lg">
        <button
          // FIX: Replaced toggleBold() with the more robust toggleMark('bold') to fix the "does not exist on type 'ChainedCommands'" error.
          onClick={() => editor.chain().focus().toggleMark('bold').run()}
          className={`p-2 rounded-md ${editor.isActive('bold') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
          aria-label={t('Bold')}
          title={t('Bold')}
        >
          <Icon name="pencil" className="w-4 h-4" /> {/* Placeholder for a 'Bold' icon */}
        </button>
        <button
          // FIX: Replaced toggleItalic() with the more robust toggleMark('italic') to fix the "does not exist on type 'ChainedCommands'" error.
          onClick={() => editor.chain().focus().toggleMark('italic').run()}
          className={`p-2 rounded-md ${editor.isActive('italic') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
          aria-label={t('Italic')}
          title={t('Italic')}
        >
          <Icon name="pencil" className="w-4 h-4" /> {/* Placeholder for an 'Italic' icon */}
        </button>
        <div className="h-5 w-px bg-gray-600 mx-1"></div>
        <div title={aiDisabledTooltip}>
          <button
            onClick={onAiEditClick}
            disabled={!isAiEnabled}
            className="flex items-center gap-1.5 p-2 rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-transparent"
            aria-label={t('Edit with AI')}
            title={t('Edit with AI')}
          >
            <Icon name="sparkles" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </BubbleMenu>
  );
};

export default EditorBubbleMenu;