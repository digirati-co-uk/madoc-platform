export type HTMLFieldSupportedTag =
  | 'strong'
  | 'em'
  | 's'
  | 'u'
  | 'code'
  | 'pre'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'ul'
  | 'ol'
  | 'blockquote'
  | 'a'
  | 'img';

export type HTMLFieldTagOption = {
  tag: HTMLFieldSupportedTag;
  label: string;
  description: string;
};

export const HTML_FIELD_SUPPORTED_TAGS: HTMLFieldTagOption[] = [
  { tag: 'strong', label: 'Bold', description: 'Enable bold text styling.' },
  { tag: 'em', label: 'Italic', description: 'Enable italic text styling.' },
  { tag: 's', label: 'Strikethrough', description: 'Enable struck-through text styling.' },
  { tag: 'u', label: 'Underline', description: 'Enable underlined text styling.' },
  { tag: 'code', label: 'Inline code', description: 'Enable inline monospace code marks.' },
  { tag: 'pre', label: 'Code block', description: 'Enable block-level code sections.' },
  { tag: 'h1', label: 'Heading 1', description: 'Enable level 1 headings.' },
  { tag: 'h2', label: 'Heading 2', description: 'Enable level 2 headings.' },
  { tag: 'h3', label: 'Heading 3', description: 'Enable level 3 headings.' },
  { tag: 'ul', label: 'Unordered list', description: 'Enable bullet list blocks.' },
  { tag: 'ol', label: 'Ordered list', description: 'Enable numbered list blocks.' },
  { tag: 'blockquote', label: 'Blockquote', description: 'Enable blockquote blocks.' },
  { tag: 'a', label: 'Link', description: 'Enable hyperlink marks.' },
  { tag: 'img', label: 'Image', description: 'Enable external image nodes.' },
];

export const HTML_FIELD_DEFAULT_ALLOWED_TAGS: HTMLFieldSupportedTag[] = HTML_FIELD_SUPPORTED_TAGS.map(option => option.tag);
