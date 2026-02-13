import React, { useMemo, useRef, useState } from 'react';
import { PageBlockDefinition } from '../../../extensions/page-blocks/extension';
import { EditorialContext, SiteBlock, SiteBlockRequest } from '../../../types/schemas/site-page';
import { ErrorBoundary } from '../utility/error-boundary';
import {
  AddBlockAdded,
  AddBlockContainer,
  AddBlockIconWrapper,
  AddBlockLabel,
  AddBlockList,
  AddBlockPluginName,
  BlockCreatorPreview,
  DefaultBlockIcon,
} from './AddBlock';
import { Button, SmallButton } from '../navigation/Button';
import { FilterInput } from '../atoms/FilterInput';
import { WhiteTickIcon } from '../icons/TickIcon';
import { useApi } from '../hooks/use-api';
import { useSite } from '../hooks/use-site';
import { useBlockEditor } from './block-editor';
import { RenderBlock } from './render-block';
import { useAvailableBlocks } from './use-available-blocks';

const BlockCreatorForm: React.FC<{
  block: SiteBlock | SiteBlockRequest;
  context?: EditorialContext;
  onSave: (block: SiteBlock) => void | Promise<void>;
}> = props => {
  const latestPreview = useRef<SiteBlock | SiteBlockRequest | undefined>(undefined);
  const { saveChanges, editor, preview, canSubmit } = useBlockEditor(
    props.block,
    newBlock => (latestPreview.current = newBlock)
  );
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div>
      {preview ? (
        <BlockCreatorPreview>
          <RenderBlock block={preview} context={props.context} />
        </BlockCreatorPreview>
      ) : null}
      {editor}
      <Button
        disabled={isSaving || !canSubmit}
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
  defaultBlocks?: PageBlockDefinition<any, any, any, any>[];
  existingBlocks?: SiteBlock[];
  blockTypesInOtherSlots?: string[];
  onSave: (block: SiteBlock) => void | Promise<void>;
  pagePath?: string;
  source?: { type: string; id: string };
}> = props => {
  const api = useApi();
  const site = useSite();
  const [chosenBlockType, setChosenBlockType] = useState<string | undefined>();

  const { filteredBlocks, contextBlocks, pluginBlocks, searchBlocks, availableBlocks, pagePathBlocks } =
    useAvailableBlocks(props);

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
        <ErrorBoundary>
          <BlockCreatorForm
            block={chosenBlock}
            context={props.context}
            onSave={savedBlock => {
              return props.onSave(savedBlock);
            }}
          />
        </ErrorBoundary>
      </div>
    );
  }

  const renderBlock = (block: PageBlockDefinition<any, any, any, any>, n: number) => {
    const added = props.existingBlocks?.find(b => b.type === block.type);
    const Icon = block.svgIcon;
    return (
      <AddBlockContainer key={block.type + n} onClick={() => setChosenBlockType(block.type)}>
        {added ? (
          <AddBlockAdded>
            <WhiteTickIcon style={{ fill: '#fff', height: '0.7em' }} />
            Added
          </AddBlockAdded>
        ) : null}
        <AddBlockIconWrapper>{Icon ? <Icon /> : <DefaultBlockIcon fill="#D1D8E8" />}</AddBlockIconWrapper>
        <AddBlockLabel>{block.label}</AddBlockLabel>
        {block.source ? (
          <AddBlockPluginName>{block.source.name}</AddBlockPluginName>
        ) : (
          <AddBlockPluginName>Built-in</AddBlockPluginName>
        )}
      </AddBlockContainer>
    );
  };

  return (
    <>
      {props.defaultBlocks && props.defaultBlocks.length ? (
        <>
          <h4>Default blocks for this slot</h4>
          <AddBlockList>{props.defaultBlocks.map(renderBlock)}</AddBlockList>
        </>
      ) : null}
      {pagePathBlocks && pagePathBlocks.length ? (
        <>
          <h4>Page specific blocks</h4>
          <AddBlockList>{pagePathBlocks.map(renderBlock)}</AddBlockList>
        </>
      ) : null}
      {contextBlocks && contextBlocks.length ? (
        <>
          <h4>Context specific blocks</h4>
          <AddBlockList>{contextBlocks.map(renderBlock)}</AddBlockList>
        </>
      ) : null}
      {pluginBlocks && pluginBlocks.length ? (
        <>
          <h4>Blocks from plugin</h4>
          <AddBlockList>{pluginBlocks.map(renderBlock)}</AddBlockList>
        </>
      ) : null}
      {availableBlocks && availableBlocks.length ? (
        <>
          <h4>All blocks</h4>
          <FilterInput type="text" onChange={e => searchBlocks(e.target.value)} placeholder="Search all blocks" />
          <AddBlockList>{filteredBlocks.map(renderBlock)}</AddBlockList>
        </>
      ) : null}
    </>
  );
};
