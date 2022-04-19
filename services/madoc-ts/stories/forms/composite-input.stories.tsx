import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { SystemListItem } from '../../src/frontend/shared/atoms/SystemListItem';
import { SystemBackground, SystemGrid, SystemMenu, SystemMenuItem } from '../../src/frontend/shared/atoms/SystemUI';
import { AnnotationStyleForm } from '../../src/frontend/shared/components/AnnotationStyleForm';

import { CompositeInput } from '../../src/frontend/shared/form/CompositeInput';
import { Input, InputContainer, InputLabel } from '../../src/frontend/shared/form/Input';
import { StyledColor } from '../../src/frontend/shared/capture-models/editor/atoms/StyledForm';
import { ButtonRow } from '../../src/frontend/shared/navigation/Button';

export default {
  title: 'Forms/Composite input',
};

export const SimpleComposite = () => {
  const [active, setActive] = useState(0);
  return (
    <div style={{ maxWidth: 500 }}>
      <InputContainer fluid>
        <InputLabel>Border example</InputLabel>
        <Input />
      </InputContainer>

      <InputContainer fluid>
        <InputLabel>Border example</InputLabel>

        <CompositeInput.Container>
          <CompositeInput.Input type="number" value={2} $filled $size="sm" />
          <CompositeInput.Text $left>px</CompositeInput.Text>
          <CompositeInput.Text>
            <strong>solid</strong>
          </CompositeInput.Text>
          <CompositeInput.InnerContainer $slim>
            <StyledColor value="#6D7AF4" />
            <CompositeInput.Text>#6D7AF4</CompositeInput.Text>
            <CompositeInput.Spacer />
            <CompositeInput.Divider />
            <CompositeInput.Stack>
              <CompositeInput.StackLabel htmlFor="rng2">Opacity</CompositeInput.StackLabel>
              <CompositeInput.StackControl>
                <input type="range" id="rng2" />
              </CompositeInput.StackControl>
            </CompositeInput.Stack>
          </CompositeInput.InnerContainer>
        </CompositeInput.Container>
      </InputContainer>

      <InputContainer fluid>
        <InputLabel>Background example</InputLabel>

        <CompositeInput.Container>
          <CompositeInput.InnerContainer $slim>
            <StyledColor value="#6D7AF4" />
            <CompositeInput.Text>#6D7AF4</CompositeInput.Text>
            <CompositeInput.Spacer />
            <CompositeInput.Divider />
            <CompositeInput.Stack>
              <CompositeInput.StackLabel htmlFor="rng1">Opacity</CompositeInput.StackLabel>
              <CompositeInput.StackControl>
                <input type="range" id="rng1" />
              </CompositeInput.StackControl>
            </CompositeInput.Stack>
          </CompositeInput.InnerContainer>
        </CompositeInput.Container>
      </InputContainer>

      <InputContainer fluid>
        <InputLabel>Button example</InputLabel>

        <CompositeInput.Container>
          <CompositeInput.InnerContainer $slim>
            <StyledColor value="#6D7AF4" />
            <CompositeInput.Text>#6D7AF4</CompositeInput.Text>
            <CompositeInput.Spacer />
            <CompositeInput.Button>Reset value</CompositeInput.Button>
          </CompositeInput.InnerContainer>
        </CompositeInput.Container>
      </InputContainer>

      <InputContainer fluid>
        <InputLabel>Input row example</InputLabel>

        <CompositeInput.Container>
          <CompositeInput.InputRow>
            <Input value="Aaa" />
            <Input value="Bbb" />
            <Input value="Ccc" />
          </CompositeInput.InputRow>
          <CompositeInput.Divider />
          <CompositeInput.Button>Button</CompositeInput.Button>
        </CompositeInput.Container>
      </InputContainer>
      <InputContainer fluid>
        <InputLabel>Input row example</InputLabel>

        <CompositeInput.Container>
          <CompositeInput.InputSplitRow>
            <Input value="Aaa" />
            <Input value="Bbb" />
            <Input value="Ccc" />
          </CompositeInput.InputSplitRow>
        </CompositeInput.Container>
      </InputContainer>

      <InputContainer fluid>
        <InputLabel>Inline select</InputLabel>

        <CompositeInput.Container>
          <CompositeInput.InputSplitRow>
            {['Aaa', 'Bbb', 'Ccc', 'Ddd'].map((value, idx) => (
              <Input
                key={idx}
                type="button"
                value={value}
                $inactive={idx !== active}
                onClick={e => {
                  e.preventDefault();
                  setActive(idx);
                }}
              />
            ))}
          </CompositeInput.InputSplitRow>
        </CompositeInput.Container>
      </InputContainer>

      <InputContainer fluid>
        <InputLabel>Inline select 2</InputLabel>

        <CompositeInput.Container>
          <CompositeInput.InputRow $flex>
            {['Aaa', 'Bbb', 'Ccc', 'Ddd'].map((value, idx) => (
              <Input
                key={idx}
                type="button"
                value={value}
                $inactive={idx !== active}
                onClick={e => {
                  e.preventDefault();
                  setActive(idx);
                }}
              />
            ))}
          </CompositeInput.InputRow>
        </CompositeInput.Container>
      </InputContainer>
    </div>
  );
};

export const AnnoStyle = () => {
  const canvas = useRef<any>();
  const displayAnno = useRef<any>();
  const [currentStyle, setCurrentStyle] = useState({
    backgroundColor: 'rgba(255, 0, 0, 0.65)',
    borderWidth: '3px',
    borderColor: '#00ff00',
    interactive: true,
    ':hover': {
      backgroundColor: 'rgba(255, 0, 0, 0.8)',
    },
  });

  useLayoutEffect(() => {
    (async function() {
      if (canvas.current) {
        const linkingAnno = {
          type: 'Annotation',
          motivation: ['linking'],
          target: 'https://digirati-co-uk.github.io/wunder/canvases/0#300,900,500,500',
        };
        const linkingAnnoWithId = await canvas.current.vault.load('fake-id', linkingAnno);
        displayAnno.current = canvas.current.createAnnotationDisplay(linkingAnnoWithId);
        displayAnno.current.applyStyle(currentStyle);
        await new Promise(resolve => setTimeout(resolve, 2500));
        canvas.current.annotations.add(displayAnno.current);
      }
    })();
  }, []);

  useEffect(() => {
    if (displayAnno.current) {
      displayAnno.current.applyStyle(currentStyle);
    }
  }, [currentStyle]);

  return (
    <SystemBackground>
      <SystemGrid.Container>
        <SystemGrid.Menu>
          <SystemMenu>
            <SystemMenuItem>Annotations panel</SystemMenuItem>
            <SystemMenuItem>Document panel</SystemMenuItem>
            <SystemMenuItem>Submission panel</SystemMenuItem>
            <SystemMenuItem>
              Current submission
              <SystemMenu>
                <SystemMenuItem>Top level</SystemMenuItem>
                <SystemMenuItem>Current level</SystemMenuItem>
                <SystemMenuItem $active>Adjacent</SystemMenuItem>
                <SystemMenuItem>Hidden</SystemMenuItem>
              </SystemMenu>
            </SystemMenuItem>
          </SystemMenu>
        </SystemGrid.Menu>
        <SystemGrid.Content>
          <SystemListItem>
            <div style={{ width: '100%' }}>
              <div style={{ marginBottom: '2em' }}>
                <Helmet>
                  <script src="https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@latest/dist/bundle.js" />
                </Helmet>
                {/* @ts-ignore */}
                <canvas-panel
                  ref={canvas}
                  height={350}
                  target="200,800,800,800"
                  manifest-id="https://digirati-co-uk.github.io/wunder.json"
                  canvas-id={'https://digirati-co-uk.github.io/wunder/canvases/0'}
                />
              </div>

              <AnnotationStyleForm
                value={currentStyle}
                onUpdate={newValues => {
                  console.log(newValues);
                  setCurrentStyle(newValues as any);
                }}
              />
            </div>
          </SystemListItem>
        </SystemGrid.Content>
      </SystemGrid.Container>
    </SystemBackground>
  );
};
