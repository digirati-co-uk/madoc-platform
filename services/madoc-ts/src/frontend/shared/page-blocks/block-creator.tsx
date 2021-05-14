import { CardHeader } from '@capture-models/editor';
import React, { useMemo, useRef, useState } from 'react';
import { EditorialContext, SiteBlock, SiteBlockRequest } from '../../../types/schemas/site-page';
import { Button, SmallButton } from '../atoms/Button';
import { useApi } from '../hooks/use-api';
import { useSite } from '../hooks/use-site';
import { useBlockEditor } from './block-editor';
import { RenderBlock } from './render-block';

const BlockCreatorForm: React.FC<{
  block: SiteBlock | SiteBlockRequest;
  context?: EditorialContext;
  onSave: (block: SiteBlock) => void | Promise<void>;
}> = props => {
  const latestPreview = useRef<SiteBlock | SiteBlockRequest | undefined>();
  const { saveChanges, editor, preview } = useBlockEditor(props.block, newBlock => (latestPreview.current = newBlock));
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div>
      {preview ? (
        <div style={{ padding: '1em' }}>
          <RenderBlock block={preview} context={props.context} />
        </div>
      ) : null}
      {editor}
      <Button
        disabled={isSaving}
        onClick={() => {
          setIsSaving(true);
          saveChanges().then(block => {
            if (block) {
              Promise.resolve(props.onSave(block)).then(() => {
                setIsSaving(false);
              });
            } else {
              setIsSaving(false);
            }
          });
        }}
      >
        Save
      </Button>
    </div>
  );
};

export const BlockCreator: React.FC<{
  context?: EditorialContext;
  onSave: (block: SiteBlock) => void | Promise<void>;
}> = props => {
  const api = useApi();
  const site = useSite();
  const [chosenBlockType, setChosenBlockType] = useState<string | undefined>();

  // Step 1: Choose a block type (possibly filter based on current context)
  // - List all block types
  const blockTypes = useMemo(() => {
    return api.pageBlocks.getDefinitions(site.id, props.context);
  }, [api.pageBlocks, props.context]);

  const chosenBlock = useMemo(() => {
    if (chosenBlockType) {
      return api.pageBlocks.createBlankBlock(chosenBlockType, site.id);
    }
  }, [site, api.pageBlocks, chosenBlockType]);

  // @todo later Step 4: Save for later

  if (chosenBlock) {
    return (
      <div>
        <SmallButton onClick={() => setChosenBlockType(undefined)}>Back to choices</SmallButton>
        <BlockCreatorForm
          block={chosenBlock}
          context={props.context}
          onSave={savedBlock => {
            console.log('on save?', savedBlock);
            return props.onSave(savedBlock);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {blockTypes.map(block => {
        return (
          <div key={block.type} style={{ marginBottom: 20 }}>
            <CardHeader>{block.label}</CardHeader>
            <Button onClick={() => setChosenBlockType(block.type)}>Add block</Button>
          </div>
        );
      })}
    </div>
  );
};
