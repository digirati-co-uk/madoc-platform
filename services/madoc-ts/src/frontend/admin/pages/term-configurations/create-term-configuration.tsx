import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { getValueDotNotation } from '../../../../utility/iiif-metadata';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { SystemDescription, SystemMetadata, SystemName } from '../../../shared/atoms/SystemUI';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { FilePreview } from '../../../shared/components/FilePreview';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { useApi } from '../../../shared/hooks/use-api';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';

function PathSelector({
  label,
  setValue,
  value,
  data,
}: {
  label: string;
  setValue: (v: string) => void;
  value: string;
  data: any;
}) {
  const dataPreview = value ? getValueDotNotation(data, value) : data;
  return (
    <div style={{ border: '1px solid #ddd', padding: '1em', marginBottom: '1em', maxWidth: '100%' }}>
      <InputContainer wide>
        <InputLabel>{label}</InputLabel>
        <Input
          type="text"
          name="item_path"
          list={'valid-keys' + label}
          onChange={e => setValue(e.currentTarget.value)}
        />
        <datalist id={'valid-keys' + label}>
          {Object.keys(data).map(key => (
            <option key={key} value={key} />
          ))}
        </datalist>
      </InputContainer>

      <pre style={{ maxHeight: 400, overflowY: 'auto', maxWidth: '100%', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(dataPreview, null, 2)}
      </pre>

      {value && !dataPreview ? (
        <WarningMessage>
          Did not find item at key <code>{value}</code>
        </WarningMessage>
      ) : null}
    </div>
  );
}

export function CreateTermConfiguration() {
  const api = useApi();
  const [url, setUrl] = useState('');
  const [templateUrl, setTemplateUrl] = useState('');
  const [listPath, setListPath] = useState('');
  const [labelPath, setLabelPath] = useState('');
  const [descriptionPath, setDescriptionPath] = useState('');
  const [resourceClassPath, setResourceClassPath] = useState('');
  const [uriPath, setUriPath] = useState('');
  const [languagePath, setLanguagePath] = useState('');

  const [listConfirmed, setListConfirmed] = useState(false);
  const [fieldsConfirmed, setFieldsConfirmed] = useState(false);

  const [createTermConfig, createTermConfigStatus] = useMutation(
    async (metadata: { label: string; description: string; attribution: string }) => {
      return api.siteManager.createTermConfiguration({
        url_pattern: templateUrl,
        paths: {
          results: listPath,
          label: labelPath,
          description: descriptionPath,
          resource_class: resourceClassPath,
          uri: uriPath,
          language: languagePath,
        },
        label: metadata.label,
        description: metadata.description || null,
        attribution: metadata.attribution || null,
      });
    }
  );

  const { data, isLoading } = useQuery(
    ['preview-term', { url }],
    async () => {
      if (!url) {
        return;
      }

      return fetch(url).then(r => r.json());
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
      retry: false,
      onSuccess: () => {
        // Reset
        setListConfirmed(false);
        setFieldsConfirmed(false);
        setListPath('');
        setLabelPath('');
        setDescriptionPath('');
        setResourceClassPath('');
        setUriPath('');
        setLanguagePath('');
      },
    }
  );

  const submitUrl = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTemplateUrl(e.currentTarget.url.value);
    setUrl(e.currentTarget.example.value);
  };

  const submitPath = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setListPath(e.currentTarget.list_path.value);
  };

  const submitConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    createTermConfig({
      label: e.currentTarget.label.value,
      description: e.currentTarget.description.value,
      attribution: e.currentTarget.attribution.value,
    });
  };

  const selectedData = listPath ? getValueDotNotation(data, listPath) : data;

  if (createTermConfigStatus.isLoading) {
    return <div>Loading...</div>;
  }

  if (createTermConfigStatus.data) {
    return (
      <div>
        <h1>Term configuration created</h1>
        <p>Term configuration has been created.</p>
        <HrefLink href={`/configure/site/terms/${createTermConfigStatus.data?.id}`}>View term configuration</HrefLink>
      </div>
    );
  }

  return (
    <>
      <SystemListItem>
        <div style={{ flex: 1, maxWidth: '100%' }}>
          <SystemMetadata>
            <SystemName>Create new term configuration</SystemName>
            <SystemDescription>
              Here you can link an external vocabulary to a term configuration. <br /> This will allow you to use the
              vocabulary in your site using the built-in autocomplete.
            </SystemDescription>
          </SystemMetadata>
          {/*
           The steps to create a new term configuration are:
            - User provides the URL
            - We make a test request and return the JSON-LD for the user to preview
            - User can then select the path to the list of terms
            - User can then select the path to the term itself
            - User can then select the path to the label
            - User can then select the path to the description
          */}

          <form onSubmit={submitUrl} style={{ marginTop: 20 }}>
            <InputContainer wide>
              <InputLabel>Example search query</InputLabel>
              <Input type="text" name="example" value="https://openlibrary.org/search.json?q=the+lord+of+the+rings" />
            </InputContainer>
            <InputContainer wide>
              <InputLabel>URL Template</InputLabel>
              <Input type="text" name="url" value="https://openlibrary.org/search.json?q=%" />
            </InputContainer>
            <Button type="submit" disabled={isLoading}>
              Preview
            </Button>
          </form>

          {data ? (
            <>
              <h4>Data preview</h4>

              <form onSubmit={submitPath} style={{ marginTop: 20 }}>
                <InputContainer wide>
                  <InputLabel>Path to list of results</InputLabel>
                  <Input type="text" name="list_path" disabled={listConfirmed} list={'valid-keys'} />
                  <datalist id={'valid-keys'}>
                    {Object.keys(data).map(key => (
                      <option key={key} value={key} />
                    ))}
                  </datalist>
                </InputContainer>
                {!listConfirmed ? <Button>Preview path</Button> : null}
              </form>

              {!listConfirmed ? (
                <>
                  <pre style={{ maxHeight: 400, overflowY: 'auto', maxWidth: '100%', whiteSpace: 'pre-wrap' }}>
                    {data
                      ? JSON.stringify(listPath ? getValueDotNotation(data, listPath) : data, null, 2)
                      : 'No data yet'}
                  </pre>

                  {selectedData && Array.isArray(selectedData) ? (
                    <>
                      <Button $primary onClick={() => setListConfirmed(true)}>
                        Confirm
                      </Button>
                    </>
                  ) : null}

                  {listPath && !selectedData ? (
                    <ErrorMessage>
                      Did not find list of results at key <code>{listPath}</code>
                    </ErrorMessage>
                  ) : null}
                </>
              ) : null}

              {listConfirmed && !fieldsConfirmed ? (
                <>
                  <PathSelector
                    label="Path to label"
                    data={selectedData[0]}
                    value={labelPath}
                    setValue={setLabelPath}
                  />

                  <PathSelector
                    label="Path to URI or identifier"
                    data={selectedData[0]}
                    value={uriPath}
                    setValue={setUriPath}
                  />

                  <PathSelector
                    label="Path to description (optional)"
                    data={selectedData[0]}
                    value={descriptionPath}
                    setValue={setDescriptionPath}
                  />

                  <PathSelector
                    label="Path to resource class (optional)"
                    data={selectedData[0]}
                    value={resourceClassPath}
                    setValue={setResourceClassPath}
                  />

                  <PathSelector
                    label="Path to language (optional)"
                    data={selectedData[0]}
                    value={languagePath}
                    setValue={setLanguagePath}
                  />

                  <Button $primary onClick={() => setFieldsConfirmed(true)}>
                    Confirm field maps
                  </Button>
                </>
              ) : null}

              {fieldsConfirmed ? (
                <div>
                  <h3>About this endpoint</h3>
                  <form onSubmit={submitConfig} style={{ marginTop: 20 }}>
                    <InputContainer wide>
                      <InputLabel>Label</InputLabel>
                      <Input type="text" name="label" />
                    </InputContainer>
                    <InputContainer wide>
                      <InputLabel>Short description</InputLabel>
                      <Input type="text" name="description" />
                    </InputContainer>
                    <InputContainer wide>
                      <InputLabel>Attribution</InputLabel>
                      <Input type="text" name="attribution" />
                    </InputContainer>

                    <Button $primary>Save term config</Button>
                  </form>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </SystemListItem>
    </>
  );
}
