import React, { ComponentType, useState } from 'react';
import { useMutation } from 'react-query';
import RichMarkdownEditorModule, { Props as RichMarkdownEditorProps, renderToHtml } from 'rich-markdown-editor';
import { SiteTerms } from '../../../../types/site-terms';
import { InfoMessage } from '../../../shared/callouts/InfoMessage';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';

const RichMarkdownEditor = (
  typeof RichMarkdownEditorModule === 'function'
    ? RichMarkdownEditorModule
    : (RichMarkdownEditorModule as unknown as { default: ComponentType<RichMarkdownEditorProps> }).default
) as ComponentType<RichMarkdownEditorProps>;

export function CreateTerms() {
  const [markdown, setMarkdown] = useState('');
  const { data } = useData<{ latest: SiteTerms }>(
    CreateTerms,
    {},
    {
      onSuccess: d => {
        setMarkdown(d.latest?.terms?.markdown || '');
      },
      retry: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const api = useApi();

  const [createTerms, createTermsStatus] = useMutation(async () => {
    const html = renderToHtml(markdown);
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    return await api.siteManager.createTerms({ markdown, text });
  });

  if (createTermsStatus.isSuccess) {
    return (
      <>
        <InfoMessage>Terms and conditions created.</InfoMessage>
        <div>
          View the terms and conditions <a href={`/s/${api.getSiteSlug()}/terms`}>here</a>.
        </div>
      </>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <>
      {data.latest?.terms?.markdown ? (
        <WarningMessage>
          Changes to the terms and conditions will prompt new and existing users to accept the new terms.
        </WarningMessage>
      ) : (
        <InfoMessage>
          Once you create the terms and conditions, new and existing users will be prompted to accept them.
        </InfoMessage>
      )}
      <div className="bg-white py-[0.6em] pr-[0.6em] pl-[2em]">
        <RichMarkdownEditor
          disableExtensions={['image']}
          defaultValue={data.latest?.terms?.markdown || ''}
          onChange={value => {
            setMarkdown(value());
          }}
        />

        <ButtonRow>
          <Button onClick={() => createTerms()} disabled={createTermsStatus.isLoading}>
            Save
          </Button>
        </ButtonRow>
      </div>
    </>
  );
}

serverRendererFor(CreateTerms, {
  getKey: () => ['site-terms', {}],
  getData: (key, vars, api) => {
    return api.siteManager.getLatestTerms();
  },
});
