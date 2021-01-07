import { CaptureModel } from '@capture-models/types';
import React, { useState } from 'react';
import { ViewDocument } from './ViewDocument';

export const Inspector: React.FC<{ captureModel: CaptureModel }> = props => {
  const [tab, setTab] = useState('overview');

  const tabs = {
    overview: <div>overview</div>,
    viewDocument: <ViewDocument document={props.captureModel.document} />,
    browseStructure: <div>browserStructure</div>,
    contributions: <div>contributions</div>,
    reviews: <div>reviews</div>,
    manageModel: <div>manageModel</div>,
  };

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <ul>
          <li onClick={() => setTab('overview')}>Overview</li>
          <li onClick={() => setTab('viewDocument')}>View document</li>
          <li onClick={() => setTab('browseStructure')}>Browse structure</li>
          <li onClick={() => setTab('contributions')}>Contributions</li>
          <li onClick={() => setTab('reviews')}>Reviews</li>
          <li onClick={() => setTab('manageModel')}>Manage model</li>
        </ul>
      </div>
      <div style={{ flex: '1 1 0px' }}>{(tabs as any)[tab]}</div>
    </div>
  );
};
