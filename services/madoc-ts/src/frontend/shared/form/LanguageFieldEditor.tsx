import React, { useState } from 'react';
import { useMetadataEditor, UseMetadataEditor } from '../hooks/use-metadata-editor';

export interface LanguageFieldEditorProps extends UseMetadataEditor {
  label: string;
}

export function LanguageFieldEditor(props: LanguageFieldEditorProps) {
  // This hook does the heavily lifting on the data side.
  const {
    firstItem,
    createNewItem,
    fieldKeys,
    changeValue,
    getFieldByKey,
    changeLanguage,
    saveChanges,
    removeItem,
  } = useMetadataEditor(props);

  // We can set these up from config, or the browser or just allow them to be passed down.
  // This is where we choose a default for which languages will appear in the dropdown.
  // The `firstItem` will be based on the i18n of the user's browser.
  const availableLanguages = props.availableLanguages || ['en', 'none'];

  // The hidden fields.
  const [showAllFields, setShowAllFields] = useState(false);
  const allFields =
    showAllFields && firstItem ? (
      <div>
        {fieldKeys.map(key => {
          const field = getFieldByKey(key);

          // We can avoid rendering the `firstItem` twice here.
          // This may not be desired in a popup (as in current madoc)
          if (key === firstItem.id) {
            return null;
          }

          const languages = [...availableLanguages];
          // Even if we don't have the language in the `availableLanguages` we
          // need to have the current language in the dropdown.
          if (availableLanguages.indexOf(field.language) === -1) {
            languages.push(field.language);
          }
          // We can also push on any fallbacks we might want always to be
          // available.
          if (availableLanguages.indexOf('none') === -1) {
            languages.unshift('none');
          }

          return (
            <div key={key}>
              <input type="text" id={key} value={field.value} onChange={e => changeValue(key, e.currentTarget.value)} />
              <select value={field.language} onChange={e => changeLanguage(key, e.currentTarget.value)}>
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <button onClick={() => removeItem(key)}>Remove</button>
            </div>
          );
        })}
        {/* Here we can call createNewItem() with true, to indicate a new on existing */}
        <button onClick={() => createNewItem(true)}>Add new value</button>
        <hr />
        <button
          onClick={() => {
            setShowAllFields(false);
            saveChanges();
          }}
        >
          Save changes to languages
        </button>
      </div>
    ) : null;

  if (!firstItem) {
    // Case 1 - we have a completely empty value.
    // { en: [] }
    // Although technically invalid, we still need to support it.
    // We could either create an empty value automatically, or, as in this case give that
    // information to the user and propmt to add a new one.
    return (
      <div>
        No value <button onClick={() => createNewItem(false)}>Create</button>
      </div>
    );
  }

  // Our default text box, we are provided with `firstItem` which is enough for
  // out on change event. For other resources we need to know what this "id" is.
  const defaultTextBox = (
    <div>
      <input
        type="text"
        value={firstItem.field.value}
        onChange={e => changeValue(firstItem.id, e.currentTarget.value)}
        onBlur={() => {
          // Saving is slightly intensive, this is a sort of semi-controlled
          // input, we will call onChange to the component using this component
          // but not after every character. Here I've set it on blur of the
          // first text box and also when you "close" the expanded view.
          saveChanges();
        }}
      />
      <button onClick={() => setShowAllFields(true)} disabled={showAllFields}>
        ({firstItem.field.language} {fieldKeys.length > 1 ? `+ ${fieldKeys.length - 1}` : ''} )
      </button>
    </div>
  );

  return (
    <div style={{ background: showAllFields ? '#eee' : '#fff' }}>
      <div>{props.label}</div>
      <div>{defaultTextBox}</div>
      <div>{allFields}</div>
    </div>
  );
}
