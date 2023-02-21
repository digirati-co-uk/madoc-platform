import { getValue } from '@iiif/vault-helpers';
import { stringify } from 'query-string';
import React, { useState } from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useCanvas } from 'react-iiif-vault';
import { useParams } from 'react-router-dom';
import { Revisions } from '../../shared/capture-models/editor/stores/revisions/index';
import { CaptureModel } from '../../shared/capture-models/types/capture-model';
import { FilePreview } from '../../shared/components/FilePreview';
import { ItemFilterContainer, ItemFilterPopupContainer } from '../../shared/components/ItemFilter';
import { useDecayState } from '../../shared/hooks/use-decay-state';
import { useLoadedCaptureModel } from '../../shared/hooks/use-loaded-capture-model';
import { BugIcon } from '../../shared/icons/BugIcon';
import { Button, ButtonIcon, ButtonRow } from '../../shared/navigation/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { useCanvasModel } from '../hooks/use-canvas-model';
import { useManifest } from '../hooks/use-manifest';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasViewerButton } from './CanvasViewerGrid';

function pascal(str: string) {
  // @ts-ignore
  return str.replaceAll(/[^a-zA-Z\d\s:]/g, '').replace(/^\w|[A-Z]|\b\w|\s+/g, function(match, index) {
    if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
    return match.toUpperCase();
  });
}

function createCodeTemplate(
  name: string,
  model: CaptureModel,
  {
    target,
    revision,
  }: {
    target?: { manifestUri: string; canvasUri: string };
    revision?: string | null;
  } = {}
) {
  const _name = pascal(name);
  return `import * as React from 'react';
import { CaptureModelTestHarness } from './CaptureModelTestHarness';
export default { title: 'Capture model interactions / ${name as any}', component: CaptureModelTestHarness };

const fixture: any = ${JSON.stringify(model)};

export const ${_name} = CaptureModelTestHarness.story({
  captureModel: fixture,
  ${
    target
      ? `target: {
    manifestUri: '${target.manifestUri}',
    canvasUri: '${target.canvasUri}',
  },
`
      : ''
  }${
    revision
      ? `revision: '${revision}',
`
      : ''
  }});
  `;
}

export function createGithubIssue(
  name: string,
  model: CaptureModel,
  {
    target,
    revision,
  }: {
    target?: { manifestUri: string; canvasUri: string };
    revision?: string | null;
  } = {}
) {
  const opts = {
    label: ['bug'],
    title: ``,
    body: `# Capture model bug - ${name}

* **environment**: ${location.hostname}
* **URL**: [View on Site](${location.href}) ${
      target
        ? `
* **Manifest**: ${target.manifestUri}
* **Canvas**: ${target.canvasUri}
`
        : ''
    }
    
<!-- Details here -->
    `,
  };
  return `https://github.com/digirati-co-uk/madoc-platform/issues/new?${stringify(opts, { arrayFormat: 'bracket' })}`;
}

export function createStorybookUrl(
  name: string,
  model: CaptureModel,
  {
    target,
    revision,
  }: {
    target?: { manifestUri: string; canvasUri: string };
    revision?: string | null;
  } = {}
) {
  const hostname =
    location.hostname === 'madoc.local'
      ? 'http://localhost:6500'
      : 'https://deploy-preview-591--madoc-storybook.netlify.app/'; // @todo change when v2.1 is released.

  return `${hostname}/?${stringify({
    path: '/story/capture-model-interactions-preview--preview-from-url',
    captureModel: JSON.stringify(model),
    target: JSON.stringify(target),
    revision,
  })}`;
}

export function CreateModelTestCase(props: { captureModel?: CaptureModel }) {
  const { buttonProps, isOpen } = useDropdownMenu(1, {
    disableFocusFirstItemOnClick: true,
  });
  const rc = useRouteContext();
  const revision = Revisions.useStoreState(s => s.currentRevisionId);
  const { data: manifest } = useManifest();
  const [successCopy, setSuccessfulCopy] = useDecayState(2000);
  // const { data: model } = useCanvasModel();
  const canvas = useCanvas();

  const options = {
    revision,
    target: undefined as { manifestUri: string; canvasUri: string } | undefined,
  };
  const manifestUri = manifest?.manifest.source;
  const canvasUri = (canvas as any)?.source_id;
  if (manifestUri && canvasUri) {
    options.target = {
      manifestUri,
      canvasUri,
    };
  }

  if (!props.captureModel || !canvas || !manifest) {
    return null;
  }

  const name = [
    (props.captureModel.document.label as any).replaceAll(/[\/']+/g, ''),
    (getValue(manifest.manifest.label) as any).replaceAll(/[\/']+/g, '') +
      ' - ' +
      (getValue(canvas.label) as any).replaceAll(/[\/']+/g, ''),
  ].join(' / ');

  return (
    <ItemFilterContainer>
      <CanvasViewerButton {...buttonProps}>
        <BugIcon />
      </CanvasViewerButton>
      <ItemFilterPopupContainer $visible={isOpen} role="menu" style={{ padding: '1em' }}>
        <ButtonRow>
          <Button $primary as="a" target="_blank" href={createGithubIssue(name, props.captureModel, options)}>
            Open github issue
          </Button>
          <Button $primary as="a" target="_blank" href={createStorybookUrl(name, props.captureModel, options)}>
            Open preview
          </Button>
          <Button
            onClick={() => {
              if (props.captureModel) {
                navigator.clipboard.writeText(createCodeTemplate(name, props.captureModel, options)).then(() => {
                  setSuccessfulCopy();
                });
              }
            }}
          >
            Copy test code
            {successCopy ? ' (copied)' : ''}
          </Button>
        </ButtonRow>
        <div>
          <ul style={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 500 }}>
            <li>
              <strong>name:</strong> {name}
            </li>
            <li>
              <strong style={{ userSelect: 'none' }}>model</strong>: {props.captureModel?.id}
            </li>
            {revision ? (
              <li>
                <strong style={{ userSelect: 'none' }}>revision</strong>: {revision}
              </li>
            ) : null}
            {options.target ? (
              <>
                <li>
                  <strong style={{ userSelect: 'none' }}>manifest:</strong>{' '}
                  <a href={options.target.manifestUri} target="_blank" rel="noreferrer">
                    {options.target.manifestUri}
                  </a>
                </li>
                <li>
                  <strong style={{ userSelect: 'none' }}>canvas:</strong> {options.target.canvasUri}
                </li>
              </>
            ) : null}
          </ul>
        </div>
        <div style={{ maxWidth: 500 }}>
          <h4>Download Fixture</h4>
          <FilePreview
            fileName={`project-${rc.projectId}-${rc.manifestId || '0'}-${rc.canvasId || '0'}.json`}
            download
            preFetch
            lazyLoad={() => ({
              type: 'text',
              value: JSON.stringify(
                {
                  url: location.href,
                  options,
                  captureModel: props.captureModel,
                },
                null,
                2
              ),
            })}
          />
        </div>
      </ItemFilterPopupContainer>
    </ItemFilterContainer>
  );
}
