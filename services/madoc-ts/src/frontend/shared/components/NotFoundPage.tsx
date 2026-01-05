import React, { useEffect, useState } from 'react';
import { Button, ButtonRow } from '../navigation/Button';
import { ErrorMessage } from '../callouts/ErrorMessage';
import { WidePageWrapper } from '../layout/WidePage';
import { mapStackTrace } from 'sourcemapped-stacktrace';
import { NotFoundPretty } from '../../../utility/errors/not-found';

export const NotFoundPage: React.FC<{ error?: any }> = () => {
  return <h1>Not found</h1>;
};

export const ErrorPage: React.FC<{ error?: Error; resetError?: () => void }> = props => {
  const [trace, setTrace] = useState<string[]>([]);

  console.log('NOT FOUND PAGE');

  useEffect(() => {
    if (props.error && props.error.stack) {
      try {
        mapStackTrace(props.error.stack, setTrace);
      } catch (err) {
        setTrace(props.error.stack.split('\n'));
      }
    }
  }, [props.error]);

  if (props.error instanceof NotFoundPretty) {
    return <h1>Not Found</h1>;
  }

  return (
    <WidePageWrapper>
      <h1>An error occurred</h1>
      <ButtonRow>
        <Button as="a" href="">
          Refresh page
        </Button>
        {props.resetError ? <Button onClick={props.resetError}>Reset error</Button> : null}
      </ButtonRow>
      <hr />
      {props.error ? (
        <ErrorMessage style={{ padding: '0.5em 1.5em' }}>
          <h2>{props.error.name}</h2>
          <pre>{props.error.message}</pre>
          {trace.map((item, idx) => (
            <pre key={idx}>{item}</pre>
          ))}
        </ErrorMessage>
      ) : null}
    </WidePageWrapper>
  );
};
