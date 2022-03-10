import { TagDefinition } from './TaggedTextField';

export const presets: { [name: string]: { blocks: TagDefinition[]; tags: TagDefinition[] } } = {
  // http://transcribe-bentham.ucl.ac.uk/td/Help:Transcription_Guidelines
  bentham: {
    blocks: [
      {
        label: 'Paragraph',
        tag: 'p',
        isHTML: true,
      },
      {
        label: 'Header',
        tag: 'header',
        isHTML: true,
        backgroundColor: '#eee',
      },
      {
        label: 'Footer',
        tag: 'footer',
        isHTML: true,
        backgroundColor: '#eee',
      },
      {
        label: 'Note',
        tag: 'note',
        color: '#999',
      },
    ],
    tags: [
      {
        label: 'Addition',
        tag: 'add',
        backgroundColor: '#a8dba9',
      },
      {
        label: 'Deletion',
        tag: 'del',
        backgroundColor: '#dea6a6',
      },
      {
        label: 'Unclear',
        tag: 'unclear',
        backgroundColor: '#d5a586',
      },
      {
        label: 'Underline',
        tag: 'u',
        isHTML: true,
      },
      {
        label: 'Superscript',
        tag: 'sup',
        isHTML: true,
      },
      {
        label: 'Subscript',
        tag: 'sub',
        isHTML: true,
      },
      {
        label: 'SIC',
        tag: 'em',
        isHTML: true,
      },
    ],
  },
};
