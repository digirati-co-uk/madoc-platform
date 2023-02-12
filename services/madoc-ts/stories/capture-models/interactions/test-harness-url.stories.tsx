import { parse } from 'query-string';
import * as React from 'react';
import { CaptureModelTestHarness } from './CaptureModelTestHarness';
export default { title: 'Capture model interactions / preview' };

export const PreviewFromUrl = () => {
  const hash = parse(window.parent ? window.parent.location.search : location.search);
  if (!hash.captureModel) {
    return (
      <div>
        This can only be seen from a preview URL in Madoc
        <pre>{JSON.stringify(hash, null, 2)}</pre>
      </div>
    );
  }

  const target = hash.target ? JSON.parse(hash.target as any) : undefined;
  const captureModel = hash.captureModel ? JSON.parse(hash.captureModel as any) : undefined;

  return (
    <CaptureModelTestHarness
      captureModel={captureModel as any}
      target={target as any}
      revision={hash.revision as any}
    />
  );
};
