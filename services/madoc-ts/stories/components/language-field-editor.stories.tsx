import * as React from 'react';
import { LanguageFieldEditor } from '../../src/frontend/shared/form/LanguageFieldEditor';

export default {
  title: 'components/Language Field Editor',
  component: LanguageFieldEditor,
  args: {
    label: 'Field label',
  },
};

const Template: any = (props: any) => <LanguageFieldEditor {...props} />;

export const EmptyLanguageEditor = Template.bind({});
EmptyLanguageEditor.args = {
  label: 'My field',
  availableLanguages: ['en', 'de', 'fr'],
  fields: {
    en: ['Some value'],
    de: ['Some other value'],
    fr: ['Some other fr value'],
  },
};
