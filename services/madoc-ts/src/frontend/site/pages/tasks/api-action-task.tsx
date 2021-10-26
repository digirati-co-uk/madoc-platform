import Ajv from 'ajv';
import { compile } from 'path-to-regexp';
import { stringify } from 'query-string';
import React, { useMemo } from 'react';
import { useMutation } from 'react-query';
import { apiDefinitionIndex } from '../../../../gateway/api-definitions/_index';
import { ApiDefinitionSubject, ApiRequest } from '../../../../gateway/api-definitions/_meta';
import { ApiActionTask } from '../../../../gateway/tasks/api-action-task';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { CanvasSnippet } from '../../../shared/components/CanvasSnippet';
import { CodeBlock } from '../../../shared/components/CodeBlock.lazy';
import { ManifestSnippet } from '../../../shared/components/ManifestSnippet';
import { useApi } from '../../../shared/hooks/use-api';

const resolveSubjectId = (subject: ApiDefinitionSubject, request: ApiRequest<any, any>) => {
  const source = subject.source;
  let sourceData = request[source];
  for (const pathId of subject.path) {
    if (!sourceData) {
      return null;
    }
    sourceData = sourceData[pathId];
  }
  return sourceData;
};

const RenderSubject: React.FC<{ subject: ApiDefinitionSubject; request: ApiRequest<any, any> }> = ({
  subject,
  request,
}) => {
  const id = resolveSubjectId(subject, request);

  if (!id) {
    return null;
  }

  if (subject.type === 'manifest') {
    return <ManifestSnippet id={id} summary={subject.label} />;
  }

  if (subject.type === 'canvas') {
    return <CanvasSnippet id={id} summary={subject.label} />;
  }

  return null;
};

export const ViewApiActionTask: React.FC<{ task: ApiActionTask; refetch: () => Promise<any> }> = ({
  task,
  refetch,
}) => {
  const api = useApi();
  const details = task.parameters[0];
  const definitionId = details?.request?.id;
  const definition = definitionId ? apiDefinitionIndex[definitionId] : null;
  const fullUrl = useMemo(() => {
    if (definition) {
      const toPathRegexp = compile(definition.url);
      const url = toPathRegexp(details.request.params);
      const query = details.request.query
        ? stringify(details.request.query, { arrayFormat: definition?.options?.queryArrayType })
        : '';
      return query ? `${url}?${query}` : url;
    }
  }, [definition, details]);

  const [runRequest, runRequestStatus] = useMutation<any>(async () => {
    if (task.id) {
      const response = await api.runDelegatedRequest(task.id);

      await refetch();

      return response;
    }
    throw new Error('No id');
  });

  const [rejectRequest, rejectRequestStatus] = useMutation<any>(async () => {
    if (task.id) {
      const response = await api.updateTask(task.id, {
        status: -1,
        status_text: 'Rejected',
      });

      await refetch();

      return response;
    }
    throw new Error('No id');
  });

  if (!definition) {
    return <div>Invalid action</div>;
  }

  return (
    <div style={{ padding: '1em' }}>
      {task.status === 3 ? <SuccessMessage>This task has been executed</SuccessMessage> : null}

      {runRequestStatus.data && runRequestStatus.data.errors
        ? runRequestStatus.data.errors.map((error: string | Ajv.ErrorObject) => {
            if (typeof error === 'string') {
              return <ErrorMessage>{error}</ErrorMessage>;
            }

            if (error.message) {
              return <ErrorMessage>{error.message}</ErrorMessage>;
            }

            return null;
          })
        : null}

      {runRequestStatus.data && !runRequestStatus.data.errors ? (
        <CodeBlock>{JSON.stringify(runRequestStatus.data, null, 2)}</CodeBlock>
      ) : null}

      <p style={{ maxWidth: 650 }}>{task.description}</p>

      {task.status === -1 && task.status_text === 'Rejected' ? (
        <ErrorMessage $banner>This request has been rejected</ErrorMessage>
      ) : (
        <ButtonRow>
          <Button
            disabled={
              !(task.status === 0 || task.status === 1) || runRequestStatus.isLoading || rejectRequestStatus.isLoading
            }
            $primary
            onClick={() => runRequest()}
          >
            Execute this request
          </Button>

          <Button
            disabled={
              !(task.status === 0 || task.status === 1) || rejectRequestStatus.isLoading || runRequestStatus.isLoading
            }
            $error
            onClick={() => rejectRequest()}
          >
            Reject this request
          </Button>

          {task.status === -1 ? (
            <Button disabled={runRequestStatus.isLoading} $primary onClick={() => runRequest()}>
              Retry this request
            </Button>
          ) : null}
        </ButtonRow>
      )}

      <h3>API Request details</h3>

      {definition.description.map((para, n) => (
        <p key={n} style={{ maxWidth: 650 }}>
          {para}
        </p>
      ))}

      {definition.subjects
        ? definition.subjects.map((subject, n) => <RenderSubject key={n} subject={subject} request={details.request} />)
        : null}

      <h5>
        {definition.method} {fullUrl}
      </h5>
      <h5>Scope of API</h5>
      <ul>
        {definition.scope.map(scope => (
          <li key={scope}>
            <pre>{scope}</pre>
          </li>
        ))}
      </ul>

      <h5>URL Params</h5>
      <CodeBlock>{JSON.stringify(details.request.params, null, 2)}</CodeBlock>

      <h5>Body</h5>
      <CodeBlock>{JSON.stringify(details.request.body, null, 2)}</CodeBlock>

      <h5>Query</h5>
      <CodeBlock>{JSON.stringify(details.request.query, null, 2)}</CodeBlock>
    </div>
  );
};
