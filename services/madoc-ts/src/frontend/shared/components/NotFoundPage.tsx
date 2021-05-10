import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { ErrorMessage } from '../atoms/ErrorMessage';
import { WidePageWrapper } from '../atoms/WidePage';
import { mapStackTrace } from 'sourcemapped-stacktrace';

export const NotFoundPage: React.FC<{ error?: any }> = () => {
  return <h1>Not found</h1>;
};

export const ErrorPage: React.FC<{ error?: Error; resetError?: () => void }> = props => {
  const [trace, setTrace] = useState<string[]>([]);

  useEffect(() => {
    if (props.error && props.error.stack) {
      try {
        mapStackTrace(props.error.stack, setTrace);
      } catch (err) {
        setTrace(props.error.stack.split('\n'));
      }
    }
  }, [props.error]);

  return (
    <WidePageWrapper>
      <h1>An error occurred</h1>
      <Button as="a" href="">
        Refresh page
      </Button>
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
