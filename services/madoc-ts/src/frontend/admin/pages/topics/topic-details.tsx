import React from 'react';
import { useTopic } from '../../../site/pages/loaders/topic-loader';

export function TopicDetails() {
  const { data } = useTopic();

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
