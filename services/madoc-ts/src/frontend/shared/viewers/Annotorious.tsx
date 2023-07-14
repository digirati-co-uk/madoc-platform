import React, { useMemo, useRef } from 'react';
import * as Annotorious from '@recogito/annotorious-openseadragon';
import '@recogito/annotorious-openseadragon/dist/annotorious.min.css';
import { OpenSeadragonViewer } from '../../site/features/OpenSeadragonViewer.lazy';
import { Revisions } from '../capture-models/editor/stores/revisions/index';
import { BaseEntityWrapper } from '../capture-models/utility/capture-model-fn';

interface AnnotoriousOptions {
  allowEmpty?: boolean;
  disableEditor?: boolean;
  disableSelect?: boolean;
  drawOnSingleClick?: boolean;
  formatters?: any[] | any;
  fragmentUnit?: string;
  gigapixelMode?: boolean;
  handleRadius?: number;
  hotkey?: any;
  locale?: string;
  messages?: any;
  readOnly?: boolean;
  widgets?: any[];
}

interface AnnotoriousInstance {
  disableEditor: boolean;
  disableSelect: boolean;
  formatters: any[];
  readOnly: boolean;
  widgets: any[];
}

export default function AnnotoriousViewer() {
  const osd = useRef<any>();
  const annotorious = useRef<any>();

  const revision = Revisions.useStoreState(s => s.currentRevision);
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const actions = Revisions.useStoreActions(a => a);

  const store = Revisions.useStore();

  const wrapper = useMemo(() => {
    if (!store.getState().currentRevision) {
      return null;
    }

    return new BaseEntityWrapper(store, []);
  }, [currentRevisionId]);

  console.log('wrapper', wrapper);

  if (wrapper) {
    // wrapper
    //   .getProperty('Date')
    //   .at(0)
    //   .set('Testing value');
    // console.log(wrapper.getProperty('Date').get());
  }

  const setupAnnotorious = (viewer: any) => {
    console.log('viewer.element', viewer.element);

    setTimeout(() => {
      annotorious.current = Annotorious(viewer, {
        // config?
      } as AnnotoriousOptions);
    }, 1000);
  };

  return <OpenSeadragonViewer ref={osd} onReady={setupAnnotorious} />;
}
