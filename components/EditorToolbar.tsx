import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
    $getSelection,
    $isRangeSelection
} from 'lexical';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListNode } from '@lexical/list';
import { $isHeadingNode, $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { $setBlocksType } from '@lexical/selection';
import Icon from './Icon';

const LowPriority = 1;

const EditorToolbar: React.FC = () => {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [blockType, setBlockType] = useState('paragraph');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    
    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            // Update text format
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));

            // Update block type
            if (elementDOM !== null) {
                // FIX: Refactored to use explicit type guards and assignments to resolve errors with getTag().
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType(anchorNode, ListNode);
                    const type = parentList ? parentList.getTag() : element.getTag();
                    setBlockType(type);
                } else {
                    if ($isHeadingNode(element)) {
                        const type = element.getTag();
                        setBlockType(type);
                    } else {
                        const type = element.getType();
                        setBlockType(type);
                    }
                }
            }
        }
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    updateToolbar();
                    return false;
                },
                LowPriority
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                LowPriority
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                LowPriority
            )
        );
    }, [editor, updateToolbar]);

    const formatHeading = (headingSize: HeadingTagType) => {
        if (blockType !== headingSize) {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(headingSize));
                }
            });
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50" aria-label="Undo"><Icon name="arrow-left" className="w-4 h-4" /></button>
            <button disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50" aria-label="Redo"><Icon name="arrow" className="w-4 h-4" /></button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            
            <select
                className="px-2 py-1 text-sm border-none bg-transparent rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-1 focus:ring-accent-500"
                value={blockType}
                onChange={(e) => {
                    const type = e.target.value;
                    if (type.startsWith('h')) {
                        formatHeading(type as HeadingTagType);
                    } else if (type === 'ol') {
                        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                    } else if (type === 'ul') {
                        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                    }
                }}
            >
                <option value="paragraph">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="ol">Numbered List</option>
                <option value="ul">Bulleted List</option>
            </select>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={`p-2 rounded ${isBold ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`} aria-label="Bold"><Icon name="beaker" className="w-4 h-4 font-bold" /></button>
            <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={`p-2 rounded ${isItalic ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`} aria-label="Italic"><Icon name="beaker" className="w-4 h-4 italic" /></button>
        </div>
    );
};

export default EditorToolbar;