import React, { useState } from 'react';
import { useMutation } from 'react-query';
import RichMarkdownEditor, { renderToHtml } from 'rich-markdown-editor';
import styled from 'styled-components';
import { SiteTerms } from '../../../../types/site-terms';
import { InfoMessage } from '../../../shared/callouts/InfoMessage';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';

const MarkdownEditorWrapper = styled.div`
  padding: 0.6em 0.6em 0.6em 2em;
  background: #fff;
`;

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
      <MarkdownEditorWrapper>
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
      </MarkdownEditorWrapper>
    </>
  );
}

serverRendererFor(CreateTerms, {
  getKey: () => ['site-terms', {}],
  getData: (key, vars, api) => {
    return api.siteManager.getLatestTerms();
  },
});
