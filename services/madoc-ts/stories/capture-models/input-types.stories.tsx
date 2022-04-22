import { PluginProvider } from '../../src/frontend/shared/capture-models/plugin-api/context';
import * as React from 'react';
import { FieldWrapper } from '../../src/frontend/shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import { RoundedCard } from '../../src/frontend/shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { FieldPreview } from '../../src/frontend/shared/capture-models/editor/components/FieldPreview/FieldPreview';

export default { title: 'Capture models/All types' };

export const AllFields: React.FC = () => {
  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <React.Suspense fallback="loading...">
        <PluginProvider>
          <FieldWrapper
            field={{
              id: '1',
              type: 'text-field',
              value: 'Value of the text field',
              description: 'Some other longer description',
              label: 'Text field',
            }}
            onUpdateValue={value => console.log(value)}
          />
          <FieldWrapper
            field={
              {
                id: '1',
                type: 'text-field',
                value: 'Value of the text field',
                multiline: true,
                description: 'Some other longer description',
                label: 'Text field',
              } as any
            }
            onUpdateValue={value => console.log(value)}
          />
          <FieldWrapper
            field={
              {
                id: '2',
                type: 'dropdown-field',
                value: '1',
                clearable: true,
                options: [
                  { text: 'Test 1', value: '1' },
                  { text: 'Test 2', value: '2' },
                  { text: 'Test 3', value: '3' },
                ],
                description: 'Some other longer description',
                label: 'Dropdown field',
              } as any
            }
            onUpdateValue={value => console.log(value)}
          />
          <FieldWrapper
            field={
              {
                id: '3',
                type: 'checkbox-field',
                value: 'value 2',
                description: 'Some other longer description',
                inlineLabel: 'Confirm this thing',
                label: 'Checkbox field',
              } as any
            }
            onUpdateValue={value => console.log(value)}
          />
          <FieldWrapper
            field={
              {
                id: '6',
                type: 'autocomplete-field',
                value: {
                  uri: 'http://id.worldcat.org/fast/fst00969633',
                  label: 'Indians of North America',
                  resource_class: 'Topic',
                },
                clearable: true,
                dataSource:
                  'https://gist.githubusercontent.com/stephenwf/8085651ddef94fb55f75c31fa33b36ab/raw/768995ed1a68eeeebd05bf791539682ae1cb5513/test.json?t=%',
                description: 'Some other longer description',
                label: 'Autocomplete field',
              } as any
            }
            onUpdateValue={value => console.log(value)}
          />
          <FieldWrapper
            field={
              {
                id: '4',
                type: 'tagged-text-field',
                value:
                  '<header>Testing a header</header><p>First paragraph</p><footer>This is a <strong>footer</strong> right.</footer>',
                preset: 'bentham',
                description: 'An HTML field',
                label: 'Tagged text field',
              } as any
            }
            onUpdateValue={value => console.log(value)}
          />
          <FieldWrapper
            field={{
              id: '5',
              type: 'html-field',
              value: 'Some other longer <strong>description</strong> testing',
              description: '<Some other longer description',
              label: 'HTML field',
            }}
            onUpdateValue={value => console.log(value)}
          />
          <FieldWrapper
            field={
              {
                id: '1',
                type: 'color-field',
                value: '#ff0000',
                description: 'Some other longer description',
                inlineLabel: 'Choose color',
                label: 'Another field',
              } as any
            }
            onUpdateValue={value => console.log(value)}
          />
        </PluginProvider>
      </React.Suspense>
    </div>
  );
};

export const WithPreview: React.FC = () => {
  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <RoundedCard>
        <PluginProvider>
          <FieldPreview
            field={
              {
                id: '1',
                type: 'text-field',
                value: 'Value of the text field',
                description: 'Some other longer description',
                label: 'Text field',
              } as any
            }
          />
          <FieldPreview
            field={
              {
                id: '2',
                type: 'dropdown-field',
                value: '1',
                clearable: true,
                options: [
                  { text: 'Test 1', value: '1' },
                  { text: 'Test 2', value: '2' },
                  { text: 'Test 3', value: '3' },
                ],
                description: 'Some other longer description',
                label: 'Dropdown field',
              } as any
            }
          />
          <FieldPreview
            field={
              {
                id: '3',
                type: 'checkbox-field',
                value: 'value 2',
                description: 'Some other longer description',
                inlineLabel: 'Confirm this thing',
                label: 'Checkbox field',
              } as any
            }
          />
          <FieldPreview
            field={
              {
                id: '4',
                type: 'tagged-text-field',
                value: `
                    <header>Testing a header</header>
                    <p>First paragraph</p>
                    <span data-tag="add">testing addition</span>
                    <strong>Testing strong</strong>
                    
                    <footer>This is a <strong>footer</strong> right.</footer>
                  `,
                preset: 'bentham',
                description: 'An HTML field',
                label: 'Tagged text field',
              } as any
            }
          />
          <FieldPreview
            field={
              {
                id: '5',
                type: 'html-field',
                value: `
                    <h1>Heading 1</h1>
                    <p>Paragraph under heading 1 which is a bit longer so that we can test multiple lines</p>
                    <h2>Heading 2</h2>
                    <p>Paragraph under heading 2 which is a bit longer so that we can test multiple lines</p>
                    <h3>Heading 3</h3>
                    <p>Paragraph under heading 3 which is a bit longer so that we can test multiple lines</p>
                    <h4>Heading 4</h4>
                    <p>Paragraph under heading 4 which is a bit longer so that we can test multiple lines</p>
                    <h5>Heading 5</h5>
                    <p>Paragraph under heading 5 which is a bit longer so that we can test multiple lines</p>
                    <h6>Heading 6</h6>
                    <p>Paragraph under heading 6 which is a bit longer so that we can test multiple lines</p>
                    
                    <blockquote>Testing block quote</blockquote>
                    <p>Paragraph under block quote which is a bit longer so that we can test multiple lines</p>
                    
                    <p>Paragraph with <em>Emphasis</em> test which is a bit longer so that we can test multiple lines</p>
                    <p>Paragraph with <strong>bold</strong> test which is a bit longer so that we can test multiple lines</p>
                    <p>Paragraph with <u>underlined</u> test which is a bit longer so that we can test multiple lines</p>
                    <ul>
                      <li>Unordered list 1</li>
                      <li>Unordered list 2</li>
                      <li>Unordered list 3</li>
                      <ul>
                        <li>Unordered list 1</li>
                        <li>Unordered list 2</li>
                        <li>Unordered list 3</li>
                      </ul>
                      <li>Unordered list 4</li>
                      <li>Unordered list 5</li>
                    </ul>
                    <p>Paragraph under unordered list</p>
                    <ol>
                      <li>Ordered list 1</li>
                      <li>Ordered list 2</li>
                      <li>Ordered list 3</li>
                      <ol>
                        <li>Ordered list 1</li>
                        <li>Ordered list 2</li>
                        <li>Ordered list 3</li>
                      </ol>
                      <li>Ordered list 4</li>
                      <li>Ordered list 5</li>
                    </ol>
                    <p>Paragraph under ordered list</p>
                    <p>Testing <code>inline code</code> in paragraph</p>
                    <p>Paragraph under code</p>
                    <pre><code>Test code</code></pre>
                    <p>Paragraph under pre/code</p>
                  `,
                description: 'Some other longer description',
                label: 'HTML field',
              } as any
            }
          />
        </PluginProvider>
      </RoundedCard>
    </div>
  );
};
