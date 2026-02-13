import * as React from 'react';
import { FieldInstanceList } from '../../src/frontend/shared/capture-models/editor/components/FieldInstanceList/FieldInstanceList';
import { FieldWrapper } from '../../src/frontend/shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import { PluginProvider } from '../../src/frontend/shared/capture-models/plugin-api/context';
import { HTMLField } from '../../src/frontend/shared/capture-models/editor/input-types/HTMLField/HTMLField';
import { FieldEditor } from '../../src/frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import '../../src/frontend/shared/capture-models/editor/input-types/HTMLField/index';

export default { title: 'Capture models/HTMLField' };

const STORY_HTML = {
  simple:
    '<h3>Baseline rich text</h3>' +
    '<p>This story demonstrates the default editor state with core inline and block formatting.</p>' +
    '<p>Try <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, and <code>inline code</code>.</p>',
  links:
    '<h3>Links enabled</h3>' +
    '<p>The link toolbar button opens an in-editor popup.</p>' +
    '<p>Click this existing <a href="https://example.org/docs">example link</a> to edit it without navigation.</p>' +
    '<p>Use Apply/Remove/Cancel in the popup controls.</p>',
  images:
    '<h3>External images enabled</h3>' +
    '<p>Use the image button to add an image URL. Existing image:</p>' +
    '<p><img src="https://placehold.co/640x180/png?text=HTMLField+Image+Example" alt="Image story example" /></p>' +
    '<p>The image node is preserved in the HTML output.</p>',
  history:
    '<h3>History controls enabled</h3>' +
    '<p>Type a few edits, then use toolbar Undo and Redo.</p>' +
    '<ol><li>Add a sentence.</li><li>Toggle a format.</li><li>Undo and Redo to verify state changes.</li></ol>',
  styles:
    '<h3>Style dropdown enabled</h3>' +
    '<p>Use the dropdown to switch between paragraph, headings, and code block.</p>' +
    '<h1>Heading Large sample</h1><h2>Heading Medium sample</h2><h3>Heading Small sample</h3>' +
    '<pre><code>// Code block sample\nconst value = "style dropdown";</code></pre>',
  disabled:
    '<h3>Disabled state</h3>' +
    '<p>This content is read-only and toolbar actions are disabled.</p>' +
    '<p>Use this mode for non-editable review flows.</p>',
  restrictedInline:
    '<h3>Restricted tags: strong, em, a</h3>' +
    '<p>Only <strong>bold</strong>, <em>italic</em>, and <a href="https://example.org/restricted">links</a> are enabled.</p>' +
    '<p>List/quote/image/code controls are hidden by the allowed tag configuration.</p>',
  allFeatures:
    '<h3>All editor features enabled</h3>' +
    '<p>This scenario combines links, images, history, and style controls.</p>' +
    '<blockquote>Use this as the broad regression story for toolbar behavior.</blockquote>' +
    '<ul><li>Inline formatting</li><li>Lists and quote</li><li>Links and images</li></ul>',
  structureOnly:
    '<h3>Structure-focused tags only</h3>' +
    '<p>This story is configured for structural tags: headings, lists, blockquote.</p>' +
    '<h2>Section heading</h2><p>Paragraph text remains available as default structure.</p>' +
    '<ul><li>Bullet item A</li><li>Bullet item B</li></ul><blockquote>Structural quote example.</blockquote>',
};

type HTMLFieldExampleProps = Partial<React.ComponentProps<typeof HTMLField>> & {
  initialValue: string;
  description: string;
};

const HTMLFieldExample: React.FC<HTMLFieldExampleProps> = ({ initialValue, description, ...props }) => {
  const [value, setValue] = React.useState(initialValue);
  return (
    <form>
      <p style={{ marginBottom: '0.75rem', color: '#3d4f61' }}>{description}</p>
      <HTMLField id="1" label="Some label" type="html-field" value={value} updateValue={setValue} {...props} />
    </form>
  );
};

export const Simple: React.FC = () => (
  <HTMLFieldExample
    initialValue={STORY_HTML.simple}
    description="Default editor with baseline formatting. Content is self-describing inside the field."
  />
);

export const WithLinks: React.FC = () => (
  <HTMLFieldExample
    initialValue={STORY_HTML.links}
    description="Link controls are enabled. Click existing links in content to open popup editing controls."
    enableLinks={true}
  />
);

export const WithExternalImages: React.FC = () => (
  <HTMLFieldExample
    initialValue={STORY_HTML.images}
    description="Image insertion is enabled and demonstrated with existing image HTML content."
    enableExternalImages={true}
  />
);

export const WithHistory: React.FC = () => (
  <HTMLFieldExample
    initialValue={STORY_HTML.history}
    description="Undo/redo toolbar controls are enabled for this story."
    enableHistory={true}
  />
);

export const WithStylesDropdown: React.FC = () => (
  <HTMLFieldExample
    initialValue={STORY_HTML.styles}
    description="Style dropdown is enabled and the content demonstrates headings and code block output."
    enableStylesDropdown={true}
  />
);

export const Disabled: React.FC = () => (
  <HTMLFieldExample
    initialValue={STORY_HTML.disabled}
    description="Disabled editor state for read-only display."
    disabled={true}
  />
);

export const WithRestrictedTags: React.FC = () => (
  <HTMLFieldExample
    initialValue={STORY_HTML.restrictedInline}
    description="Only strong/em/link tags are enabled via allowedTags."
    enableLinks={true}
    enableExternalImages={true}
    allowedTags={['strong', 'em', 'a']}
  />
);

export const AllFeaturesEnabled: React.FC = () => (
  <HTMLFieldExample
    initialValue={STORY_HTML.allFeatures}
    description="Comprehensive scenario: links, images, history, and styles all enabled."
    enableLinks={true}
    enableExternalImages={true}
    enableHistory={true}
    enableStylesDropdown={true}
  />
);

export const StructureOnlyTags: React.FC = () => (
  <HTMLFieldExample
    initialValue={STORY_HTML.structureOnly}
    description="Allowed tags restricted to structure-oriented controls."
    enableLinks={true}
    enableExternalImages={true}
    enableStylesDropdown={true}
    allowedTags={['h1', 'h2', 'h3', 'ul', 'ol', 'blockquote']}
  />
);

export const WithPreview: React.FC = () => {
  return (
    <PluginProvider>
      <FieldInstanceList
        property="test"
        fields={[
          {
            id: '1',
            type: 'html-field',
            value:
              '<p>This preview story demonstrates stored HTML rendering.</p><p><strong>Bold</strong> and <u>underline</u> are visible.</p>',
            description: 'Some other longer description',
            label: 'Another field',
          } as any,
        ]}
      />
    </PluginProvider>
  );
};

export const WithFieldWrapper: React.FC = () => {
  return (
    <PluginProvider>
      <FieldWrapper
        field={{
          id: '1',
          type: 'html-field',
          value: '<p>FieldWrapper story content with <strong>HTML</strong>.</p>',
          description: 'Some other longer description',
          label: 'Another field',
        }}
        onUpdateValue={value => console.log(value)}
      />
    </PluginProvider>
  );
};

export const HTMLFieldEditor: React.FC = () => {
  return (
    <React.Suspense fallback={null}>
      <PluginProvider>
        <div style={{ margin: 40 }}>
          <FieldEditor
            field={{
              id: '1',
              type: 'html-field',
              value: '<p>Field editor configuration story</p>',
              description: 'Some other longer description',
              label: 'Another field',
            }}
            onDelete={() => {
              console.log('deleted');
            }}
            onSubmit={newField => console.log(newField)}
          />
        </div>
      </PluginProvider>
    </React.Suspense>
  );
};
