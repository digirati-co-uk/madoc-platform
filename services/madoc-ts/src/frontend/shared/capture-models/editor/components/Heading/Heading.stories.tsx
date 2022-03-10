import * as React from 'react';
import { Heading } from './Heading';

export default { title: 'Capture model editor components/Heading' };

export const Large: React.FC = () => (
  <div>
    <Heading size="large">Large heading</Heading>
    <p>With paragraph text under the heading</p>
  </div>
);

export const Medium: React.FC = () => (
  <div>
    <Heading size="medium">Medium heading</Heading>
    <p>With paragraph text under the heading</p>
  </div>
);

export const Small: React.FC = () => (
  <div>
    <Heading size="small">Small heading</Heading>
    <p>With paragraph text under the heading</p>
  </div>
);

export const Document: React.FC = () => (
  <div>
    <Heading size="large">Main heading</Heading>
    <p style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      With the paragraph text under the heading. With the paragraph text under the heading. With the paragraph text
      under the heading. With the paragraph text under the heading. With the paragraph text under the heading. With the
      paragraph text under the heading. With the paragraph text under the heading
    </p>
    <Heading size="medium">First medium heading</Heading>
    <p style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      With the paragraph text under the heading. With the paragraph text under the heading. With the paragraph text
      under the heading. With the paragraph text under the heading. With the paragraph text under the heading. With the
      paragraph text under the heading. With the paragraph text under the heading
    </p>
    <Heading size="medium">Second heading</Heading>
    <p style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      With the paragraph text under the heading. With the paragraph text under the heading. With the paragraph text
      under the heading. With the paragraph text under the heading. With the paragraph text under the heading. With the
      paragraph text under the heading. With the paragraph text under the heading
    </p>
    <Heading size="small">First small heading</Heading>
    <p style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      With the paragraph text under the heading. With the paragraph text under the heading. With the paragraph text
      under the heading. With the paragraph text under the heading. With the paragraph text under the heading. With the
      paragraph text under the heading. With the paragraph text under the heading
    </p>
    <Heading size="medium">Last medium heading</Heading>
    <p style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      With the paragraph text under the heading. With the paragraph text under the heading. With the paragraph text
      under the heading. With the paragraph text under the heading. With the paragraph text under the heading. With the
      paragraph text under the heading. With paragraph text under the heading
    </p>
  </div>
);
