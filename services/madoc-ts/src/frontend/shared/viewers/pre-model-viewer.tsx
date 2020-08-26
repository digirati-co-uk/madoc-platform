import { CanvasFull } from '../../../types/schemas/canvas-full';
import React, { useState } from 'react';
import { CanvasContext, useVaultEffect } from '@hyperion-framework/react-vault';
import { SimpleAtlasViewer } from '../components/SimpleAtlasViewer';
import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../atoms/EditorToolbar';
import { HrefLink } from '../utility/href-link';
import { ArrowBackIcon } from '../icons/ArrowBackIcon';
import { PreviewIcon } from '../icons/PreviewIcon';
import { FullScreenExitIcon } from '../icons/FullScreenExitIcon';
import { FullScreenEnterIcon } from '../icons/FullScreenEnterIcon';
import { MaximiseWindow } from '../atoms/MaximiseWindow';
import { LocaleString } from '../components/LocaleString';
import { useCurrentUser } from '../hooks/use-current-user';
import { Button } from '../atoms/Button';
import { Heading3 } from '../atoms/Heading3';

export const PreModelViewer: React.FC<{
  canvas: CanvasFull['canvas'];
  backLink?: string;
  onContribute?: () => Promise<void>;
}> = ({ backLink, canvas, onContribute }) => {
  const [canvasRef, setCanvasRef] = useState<any>();
  const [isVertical, setIsVertical] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useCurrentUser(true);

  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  useVaultEffect(
    vault => {
      if (canvas) {
        vault
          .load(
            canvas.source.id || canvas.source['@id'],
            canvas.source['@id']
              ? {
                  '@context': 'http://iiif.io/api/presentation/2/context.json',
                  ...canvas.source,
                }
              : canvas.source
          )
          .then(c => {
            console.log(c);
            setCanvasRef(c as any);
          });
      }
    },
    [canvas.source]
  );

  return (
    <div>
      <MaximiseWindow>
        {({ toggle, isOpen }) => (
          <>
            <EditorToolbarContainer>
              {backLink ? (
                <EditorToolbarButton as={HrefLink} href={backLink}>
                  <EditorToolbarIcon>
                    <ArrowBackIcon />
                  </EditorToolbarIcon>
                </EditorToolbarButton>
              ) : null}
              <EditorToolbarTitle as={LocaleString}>{canvas.label}</EditorToolbarTitle>
              <EditorToolbarSpacer />

              <EditorToolbarButton onClick={() => setIsVertical(r => !r)}>
                <EditorToolbarIcon>
                  <PreviewIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>Switch layout</EditorToolbarLabel>
              </EditorToolbarButton>
              <EditorToolbarButton onClick={toggle}>
                <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
              </EditorToolbarButton>
            </EditorToolbarContainer>
            <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row' }}>
              <div style={{ width: isVertical ? '100%' : '67%' }}>
                {canvasRef ? (
                  <CanvasContext canvas={canvasRef.id}>
                    <SimpleAtlasViewer style={{ height: '60vh' }} />
                  </CanvasContext>
                ) : null}
              </div>
              <div style={{ width: isVertical ? '100%' : '33%', padding: '1em' }}>
                <Heading3 $margin>Nothing submitted yet.</Heading3>
                {canContribute && onContribute ? (
                  <div>
                    <Button
                      disabled={isLoading}
                      onClick={() => {
                        setIsLoading(true);
                        onContribute();
                      }}
                    >
                      Start submission
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </MaximiseWindow>
    </div>
  );
};
