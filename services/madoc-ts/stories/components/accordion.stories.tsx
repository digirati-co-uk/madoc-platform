import * as React from 'react';
import { BugIcon } from '../../src/frontend/shared/icons/BugIcon';
import { Accordion, AccordionContainer, AccordionItem } from '../../src/frontend/shared/navigation/Accordion';

export default { title: 'components / Accordion', panel: 'right' };

export const defaultStory = () => {
  return (
    <div style={{ flex: 1, marginBottom: '2em' }}>
      <h3 style={{ paddingLeft: '0.5em' }}>Accordion</h3>
      <Accordion
        maxHeight={false}
        items={[
          {
            label: 'First one',
            initialOpen: true,
            children: <div>This is the first one</div>,
          },
          {
            label: 'Second one',
            children: <div>This is the second one</div>,
          },
          {
            label: 'Very long one',
            children: (
              <div>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
                <p>Long example</p>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export const withComposition = () => {
  return (
    <div style={{ flex: 1, marginBottom: '2em' }}>
      <h3 style={{ paddingLeft: '0.5em' }}>Accordion with composition</h3>
      <AccordionContainer>
        <AccordionItem label="First one">
          <div>This is the first one</div>
        </AccordionItem>
        <AccordionItem label="Second one">
          <div>This is the second one</div>
        </AccordionItem>
      </AccordionContainer>
    </div>
  );
};

export const largeVariation = () => {
  return (
    <div style={{ flex: 1, marginBottom: '2em' }}>
      <h3 style={{ paddingLeft: '0.5em' }}>Accordion with composition</h3>
      <AccordionContainer>
        <AccordionItem large label="First one" description="With description">
          <div>This is the first one</div>
        </AccordionItem>
        <AccordionItem large label="Second one" description="With description" initialOpen icon={<BugIcon />}>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
        </AccordionItem>
        <AccordionItem
          large
          label="Third one"
          description={
            <span>
              This is a long description
              <br /> and will wrap
            </span>
          }
          initialOpen
          icon={<BugIcon />}
          maxHeight={false}
        >
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
          <p>This is the second one</p>
        </AccordionItem>
      </AccordionContainer>
    </div>
  );
};

export const withSingleMode = () => {
  return (
    <div style={{ flex: 1, marginBottom: '2em' }}>
      <h3 style={{ paddingLeft: '0.5em' }}>Accordion (single mode)</h3>
      <Accordion
        singleMode
        items={[
          {
            label: 'First one with a very long title that will be trimmed',
            initialOpen: true,
            children: (
              <div>
                <p>This is the first one</p>
                <p>This is the first one</p>
                <p>This is the first one</p>
                <p>This is the first one</p>
                <p>This is the first one</p>
              </div>
            ),
          },
          {
            label: 'Second one',
            children: (
              <div>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
              </div>
            ),
          },
          {
            label: 'Third one',
            children: (
              <div>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
              </div>
            ),
          },
          {
            label: 'Fouth one',
            children: (
              <div>
                <p>
                  This is the second one. This is the second one. This is the second one. This is the second one. This
                  is the second one. This is the second one.{' '}
                </p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
