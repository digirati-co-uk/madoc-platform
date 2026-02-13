import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ArrowBackIcon } from '../../../../icons/ArrowBackIcon';
import { ArrowForwardIcon } from '../../../../icons/ArrowForwardIcon';
import { LinkIcon } from '../../../../icons/LinkIcon';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { HTMLFieldSupportedTag } from './html-field-tags';
import { NumberedListIcon } from '@/frontend/shared/icons/NumberedListIcon';
import { UnorderedListIcon } from '@/frontend/shared/icons/UnorderedListIcon';
import { AddImageIcon } from '@/frontend/shared/icons/AddImageIcon';
import { CodeIcon } from '@/frontend/shared/icons/CodeIcon';
import { QuoteIcon } from '@/frontend/shared/icons/QuoteIcon';

export interface HTMLFieldProps extends BaseField {
  type: 'html-field';
  allowedTags?: string[];
  format?: 'html' | 'markdown';
  value: string;
  enableHistory?: boolean;
  enableExternalImages?: boolean;
  enableLinks?: boolean;
  enableStylesDropdown?: boolean;
  disabled?: boolean;
}

type ToolbarStyleOption = 'unstyled' | 'header-one' | 'header-two' | 'header-three' | 'code-block';
type HeadingLevel = 1 | 2 | 3;

type ToolbarButtonProps = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
};

const joinClasses = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

const editorClassName =
  'min-h-[8rem] p-3 text-[1em] leading-[1.5em] text-[#052a44] outline-none ' +
  '[&_p]:my-[0.85em] [&_h1]:my-[0.5em] [&_h1]:text-[1.75em] [&_h2]:my-[0.5em] [&_h2]:text-[1.45em] ' +
  '[&_h3]:my-[0.5em] [&_h3]:text-[1.2em] [&_blockquote]:my-[0.65em] [&_blockquote]:border-l-[3px] ' +
  '[&_blockquote]:border-[rgba(5,42,68,0.4)] [&_blockquote]:pl-[0.65em] [&_blockquote]:italic ' +
  '[&_ul]:my-[0.85em] [&_ul]:ml-[2em] [&_ol]:my-[0.85em] [&_ol]:ml-[2em] [&_code]:rounded-[3px] ' +
  '[&_code]:bg-[rgba(5,42,68,0.1)] [&_code]:px-[0.4em] [&_code]:py-[0.1em] [&_pre_>_code]:block ' +
  '[&_pre_>_code]:p-[0.65em] [&_a]:text-[#005cc5] [&_a]:underline';

const toolbarButtonClassName = (active?: boolean, disabled?: boolean) =>
  joinClasses(
    'rounded border text-xs h-8 w-8 flex items-center justify-center font-semibold transition-colors',
    active
      ? 'border-[rgba(5,42,68,0.3)] bg-[rgba(5,42,68,0.2)] text-[rgba(5,42,68,0.95)]'
      : 'border-[rgba(5,42,68,0.2)] bg-[rgba(5,42,68,0.05)] text-[rgba(5,42,68,0.9)] hover:bg-[rgba(5,42,68,0.2)]',
    disabled && 'cursor-not-allowed opacity-60 hover:bg-[rgba(5,42,68,0.05)]'
  );

const normalizeHtml = (value?: string) => {
  const html = (value || '').trim();
  if (!html || html === '<p></p>' || html === '<p><br></p>') {
    return '';
  }
  return html;
};

const toHeadingStyle = (level: HeadingLevel): ToolbarStyleOption => {
  if (level === 1) {
    return 'header-one';
  }
  if (level === 2) {
    return 'header-two';
  }
  return 'header-three';
};

const setStyle = (editor: Editor, style: ToolbarStyleOption) => {
  switch (style) {
    case 'header-one':
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      return;
    case 'header-two':
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    case 'header-three':
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      return;
    case 'code-block':
      editor.chain().focus().toggleCodeBlock().run();
      return;
    case 'unstyled':
    default:
      editor.chain().focus().setParagraph().run();
  }
};

const getStyleFromEditor = (editor: Editor, headingLevels: HeadingLevel[], canCodeBlock: boolean): ToolbarStyleOption => {
  if (canCodeBlock && editor.isActive('codeBlock')) {
    return 'code-block';
  }
  for (const level of headingLevels) {
    if (editor.isActive('heading', { level })) {
      return toHeadingStyle(level);
    }
  }
  return 'unstyled';
};

const GlyphIcon: React.FC<{ value: string; className?: string }> = ({ value, className }) => {
  return <div className={joinClasses('w-4 h-4 inline-flex items-center justify-center text-[15px] leading-none', className)}>{value}</div>;
};


const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, icon, active, disabled, onClick, title }) => {
  return (
    <button
      type="button"
      title={title || label}
      disabled={disabled}
      className={toolbarButtonClassName(active, disabled)}
      onMouseDown={event => event.preventDefault()}
      onClick={onClick}
    >
      {icon}
    </button>
  );
};

const castToAllowedTag = (value: string): HTMLFieldSupportedTag | undefined => {
  const normalized = value.toLowerCase();
  if (
    normalized === 'strong' ||
    normalized === 'em' ||
    normalized === 's' ||
    normalized === 'u' ||
    normalized === 'code' ||
    normalized === 'pre' ||
    normalized === 'h1' ||
    normalized === 'h2' ||
    normalized === 'h3' ||
    normalized === 'ul' ||
    normalized === 'ol' ||
    normalized === 'blockquote' ||
    normalized === 'a' ||
    normalized === 'img'
  ) {
    return normalized;
  }
  return undefined;
};

export const HTMLField: FieldComponent<HTMLFieldProps> = ({
  value,
  format = 'html',
  allowedTags,
  updateValue,
  enableExternalImages,
  enableHistory,
  enableLinks,
  enableStylesDropdown,
  disabled,
}) => {
  const [updateExternalValue] = useDebouncedCallback((nextValue: string) => {
    updateValue(nextValue);
  }, 200);

  const markdownWarningShown = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [, refreshState] = useReducer((state: number) => state + 1, 0);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkDraft, setLinkDraft] = useState('https://');

  const allowedTagSet = useMemo(() => {
    const cleanedTags = (allowedTags || [])
      .map(tag => castToAllowedTag(tag))
      .filter((tag): tag is HTMLFieldSupportedTag => !!tag);

    if (!cleanedTags.length) {
      return undefined;
    }

    return new Set(cleanedTags);
  }, [allowedTags]);

  const isTagAllowed = (tag: HTMLFieldSupportedTag) => !allowedTagSet || allowedTagSet.has(tag);

  const canBold = isTagAllowed('strong');
  const canItalic = isTagAllowed('em');
  const canStrike = isTagAllowed('s');
  const canUnderline = isTagAllowed('u');
  const canInlineCode = isTagAllowed('code');
  const canCodeBlock = isTagAllowed('pre');
  const canBlockquote = isTagAllowed('blockquote');
  const canBulletList = isTagAllowed('ul');
  const canOrderedList = isTagAllowed('ol');
  const canImage = !!enableExternalImages && isTagAllowed('img');
  const canLink = !!enableLinks && isTagAllowed('a');

  const headingLevels = useMemo(() => {
    const levels: HeadingLevel[] = [];
    if (isTagAllowed('h1')) {
      levels.push(1);
    }
    if (isTagAllowed('h2')) {
      levels.push(2);
    }
    if (isTagAllowed('h3')) {
      levels.push(3);
    }
    return levels;
  }, [allowedTagSet]);

  const styleOptions = useMemo(() => {
    const options: Array<{ label: string; style: ToolbarStyleOption }> = [{ label: 'Normal', style: 'unstyled' }];
    if (headingLevels.includes(1)) {
      options.push({ label: 'Heading Large', style: 'header-one' });
    }
    if (headingLevels.includes(2)) {
      options.push({ label: 'Heading Medium', style: 'header-two' });
    }
    if (headingLevels.includes(3)) {
      options.push({ label: 'Heading Small', style: 'header-three' });
    }
    if (canCodeBlock) {
      options.push({ label: 'Code Block', style: 'code-block' });
    }
    return options;
  }, [headingLevels, canCodeBlock]);

  useEffect(() => {
    if (format === 'markdown' && process.env.NODE_ENV !== 'production' && !markdownWarningShown.current) {
      // eslint-disable-next-line no-console
      console.warn('[HTMLField] `format="markdown"` is no longer supported in editor runtime, falling back to HTML.');
      markdownWarningShown.current = true;
    }
  }, [format]);

  const showLinkEditor = (prefilledHref?: string) => {
    const valueToUse = (prefilledHref || '').trim();
    setLinkDraft(valueToUse || 'https://');
    setShowLinkPopover(true);
  };

  const extensions = useMemo(() => {
    const editorExtensions = [
      StarterKit.configure({
        history: !!enableHistory,
        bold: canBold,
        italic: canItalic,
        strike: canStrike,
        code: canInlineCode,
        codeBlock: canCodeBlock,
        blockquote: canBlockquote,
        bulletList: canBulletList,
        orderedList: canOrderedList,
        heading: headingLevels.length ? { levels: headingLevels } : false,
      } as any),
    ];

    if (canUnderline) {
      editorExtensions.push(Underline);
    }

    if (canLink) {
      editorExtensions.push(
        Link.configure({
          autolink: false,
          openOnClick: false,
          defaultProtocol: 'https',
        })
      );
    }

    if (canImage) {
      editorExtensions.push(Image);
    }

    return editorExtensions;
  }, [
    canBold,
    canItalic,
    canStrike,
    canInlineCode,
    canCodeBlock,
    canBlockquote,
    canBulletList,
    canOrderedList,
    canUnderline,
    canLink,
    canImage,
    headingLevels,
    enableHistory,
  ]);

  const editor = useEditor(
    {
      extensions,
      content: value || '',
      immediatelyRender: false,
      editable: !disabled,
      editorProps: {
        attributes: {
          class: editorClassName,
        },
        handleClick: (_view, _pos, event) => {
          const target = event.target as HTMLElement | null;
          const anchor = target?.closest('a') as HTMLAnchorElement | null;
          if (!anchor) {
            return false;
          }

          event.preventDefault();
          event.stopPropagation();

          if (canLink) {
            showLinkEditor(anchor.getAttribute('href') || undefined);
          }

          return true;
        },
      },
      onSelectionUpdate: () => {
        refreshState();
      },
      onUpdate: ({ editor: tiptapEditor }) => {
        refreshState();
        updateExternalValue(normalizeHtml(tiptapEditor.getHTML()));
      },
    },
    [extensions, canLink]
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentValue = normalizeHtml(editor.getHTML());
    const nextValue = normalizeHtml(value);

    if (currentValue !== nextValue) {
      editor.commands.setContent(nextValue || '', false);
    }
  }, [editor, value]);

  useEffect(() => {
    if (!showLinkPopover) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        setShowLinkPopover(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [showLinkPopover]);

  useEffect(() => {
    if (!canLink) {
      setShowLinkPopover(false);
    }
  }, [canLink]);

  const styleValue = editor ? getStyleFromEditor(editor, headingLevels, canCodeBlock) : 'unstyled';
  const linkIsActive = !!editor?.isActive('link');
  const canUndo = !!editor?.can().chain().focus().undo().run();
  const canRedo = !!editor?.can().chain().focus().redo().run();

  const runCommand = (command: (editor: Editor) => void) => {
    if (!editor || disabled) {
      return;
    }

    command(editor);
  };

  const onLinkButtonClick = () => {
    if (!editor || disabled || !canLink) {
      return;
    }

    editor.chain().focus().extendMarkRange('link').run();
    const href = (editor.getAttributes('link').href || '') as string;
    showLinkEditor(href);
  };

  const applyLink = () => {
    if (!editor || disabled || !canLink) {
      return;
    }

    const href = linkDraft.trim();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!href) {
      chain.unsetLink().run();
      setShowLinkPopover(false);
      return;
    }

    chain.setLink({ href }).run();
    setShowLinkPopover(false);
  };

  const removeLink = () => {
    if (!editor || disabled || !canLink) {
      return;
    }
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkPopover(false);
  };

  const onImageClick = () => {
    if (!editor || disabled || !canImage) {
      return;
    }

    const src = typeof window !== 'undefined' ? window.prompt('Enter image URL', 'https://') : null;
    if (!src) {
      return;
    }

    editor.chain().focus().setImage({ src: src.trim() }).run();
  };

  if (!editor) {
    return <div className="rounded border border-[rgba(5,42,68,0.2)] p-3 text-sm text-[rgba(5,42,68,0.7)]">Loading...</div>;
  }

  return (
    <div ref={rootRef} className="overflow-hidden rounded border border-[rgba(5,42,68,0.2)] font-inherit focus-within:border-[#005cc5]">
      <div className="relative flex flex-wrap items-center gap-1 border-b border-[rgba(5,42,68,0.2)] bg-white p-2">
        {canBold ? (
          <ToolbarButton
            label="Bold"
            icon={<GlyphIcon value="B" className="font-bold" />}
            title="Bold"
            active={editor.isActive('bold')}
            disabled={disabled}
            onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().toggleBold().run())}
          />
        ) : null}

        {canItalic ? (
          <ToolbarButton
            label="Italic"
            icon={<GlyphIcon value="I" className="italic" />}
            title="Italic"
            active={editor.isActive('italic')}
            disabled={disabled}
            onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().toggleItalic().run())}
          />
        ) : null}

        {canStrike ? (
          <ToolbarButton
            label="Strike"
            icon={<GlyphIcon value="S" className="line-through" />}
            title="Strikethrough"
            active={editor.isActive('strike')}
            disabled={disabled}
            onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().toggleStrike().run())}
          />
        ) : null}

        {canInlineCode ? (
          <ToolbarButton
            label="Code"
            icon={<CodeIcon className="text-lg fill-current" />}
            title="Inline code"
            active={editor.isActive('code')}
            disabled={disabled}
            onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().toggleCode().run())}
          />
        ) : null}

        {canUnderline ? (
          <ToolbarButton
            label="Underline"
            icon={<GlyphIcon value="U" className="underline" />}
            title="Underline"
            active={editor.isActive('underline')}
            disabled={disabled}
            onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().toggleUnderline().run())}
          />
        ) : null}

        {canBulletList ? (
          <ToolbarButton
            label="Bullets"
            icon={<UnorderedListIcon className="text-lg fill-current" />}
            title="Unordered list"
            active={editor.isActive('bulletList')}
            disabled={disabled}
            onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().toggleBulletList().run())}
          />
        ) : null}

        {canOrderedList ? (
          <ToolbarButton
            label="Numbered"
            icon={<NumberedListIcon className="text-lg fill-current" />}
            title="Ordered list"
            active={editor.isActive('orderedList')}
            disabled={disabled}
            onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().toggleOrderedList().run())}
          />
        ) : null}

        {canBlockquote ? (
          <ToolbarButton
            label="Quote"
            icon={<QuoteIcon className="text-lg fill-current" />}
            title="Blockquote"
            active={editor.isActive('blockquote')}
            disabled={disabled}
            onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().toggleBlockquote().run())}
          />
        ) : null}

        {enableHistory ? (
          <>
            <ToolbarButton
              label="Undo"
              icon={<ArrowBackIcon className="text-lg fill-current" />}
              title="Undo"
              disabled={disabled || !canUndo}
              onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().undo().run())}
            />
            <ToolbarButton
              label="Redo"
              icon={<ArrowForwardIcon className="text-lg fill-current" />}
              title="Redo"
              disabled={disabled || !canRedo}
              onClick={() => runCommand(tipTapEditor => tipTapEditor.chain().focus().redo().run())}
            />
          </>
        ) : null}

        {canLink ? (
          <ToolbarButton
            label="Link"
            icon={<LinkIcon className="text-lg fill-current" />}
            title="Add or edit link"
            active={linkIsActive || showLinkPopover}
            disabled={disabled}
            onClick={onLinkButtonClick}
          />
        ) : null}

        {canImage ? (
          <ToolbarButton
            label="Image"
            icon={<AddImageIcon className="text-lg" />}
            title="Insert image from URL"
            disabled={disabled}
            onClick={onImageClick}
          />
        ) : null}

        {enableStylesDropdown ? (
          <label className="ml-1 flex items-center gap-2 text-xs font-semibold text-[rgba(5,42,68,0.85)]">
            Style
            <select
              className={joinClasses(
                'rounded border border-[rgba(5,42,68,0.2)] bg-white px-2 py-1 text-xs',
                disabled && 'cursor-not-allowed opacity-60'
              )}
              disabled={disabled}
              value={styleValue}
              onChange={event => {
                if (!editor || disabled) {
                  return;
                }
                setStyle(editor, event.target.value as ToolbarStyleOption);
              }}
            >
              {styleOptions.map(option => (
                <option key={option.style} value={option.style}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {canLink && showLinkPopover ? (
          <div className="absolute left-2 top-[calc(100%+0.3rem)] z-20 w-[22rem] rounded border border-[rgba(5,42,68,0.2)] bg-white p-2 shadow-md">
            <label className="mb-1 block text-xs font-semibold text-[rgba(5,42,68,0.85)]">Link URL</label>
            <input
              className="w-full rounded border border-[rgba(5,42,68,0.2)] px-2 py-1 text-sm outline-none focus:border-[#005cc5]"
              value={linkDraft}
              onChange={event => setLinkDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  applyLink();
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setShowLinkPopover(false);
                }
              }}
              placeholder="https://example.com"
              autoFocus
            />
            <div className="mt-2 flex items-center justify-end gap-1">
              <button
                type="button"
                className="rounded border border-[rgba(5,42,68,0.2)] px-2 py-1 text-xs"
                onClick={() => setShowLinkPopover(false)}
              >
                Cancel
              </button>
              {linkIsActive ? (
                <button
                  type="button"
                  className="rounded border border-[rgba(5,42,68,0.2)] px-2 py-1 text-xs"
                  onClick={removeLink}
                >
                  Remove
                </button>
              ) : null}
              <button
                type="button"
                className="rounded border border-[#005cc5] bg-[#005cc5] px-2 py-1 text-xs text-white"
                onClick={applyLink}
              >
                Apply
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default HTMLField;
