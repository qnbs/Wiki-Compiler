import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from 'lexical';
import { $getSelectionStyleValueForProperty } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import Icon from './Icon';

const LowPriority = 1;

interface EditorBubbleMenuProps {
  onAiEditClick: () => void;
  isAiEnabled: boolean;
  aiDisabledTooltip?: string;
}

const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ onAiEditClick, isAiEnabled, aiDisabledTooltip }) => {
  const { t } = useTranslation();
  const [editor] = useLexicalComposerContext();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const updateBubble = useCallback(() => {
    const selection = $getSelection();
    const bubble = bubbleRef.current;

    if (editor.isComposing() || !bubble || !$isRangeSelection(selection) || selection.isCollapsed() ) {
        setShowBubble(false);
        return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
        setShowBubble(false);
        return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    
    bubble.style.left = `${rect.left + window.scrollX + rect.width / 2 - bubble.offsetWidth / 2}px`;
    bubble.style.top = `${rect.top + window.scrollY - bubble.offsetHeight - 10}px`;

    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setShowBubble(true);

  }, [editor]);
  
  useEffect(() => {
    return mergeRegister(
        editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateBubble();
            });
        }),
        editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
            updateBubble();
            return false;
        }, LowPriority),
    );
  }, [editor, updateBubble]);
  

  return createPortal(
    <div
      ref={bubbleRef}
      style={{
        opacity: showBubble ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        pointerEvents: showBubble ? 'auto' : 'none',
      }}
      className="absolute z-10"
    >
      <div className="flex items-center gap-1 bg-gray-800 text-white px-2 py-1 rounded-lg shadow-lg">
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          className={`p-2 rounded-md ${isBold ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
          aria-label={t('Bold')}
          title={t('Bold')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" /></svg>
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          className={`p-2 rounded-md ${isItalic ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
          aria-label={t('Italic')}
          title={t('Italic')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 4.5 5.25 6m-5.25 6 5.25-6m-5.25-6-5.25 6m5.25 6-5.25-6" /></svg>
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
    </div>,
    document.body
  );
};

export default EditorBubbleMenu;
