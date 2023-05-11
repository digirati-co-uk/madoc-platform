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

const BlockCreatorForm: React.FC<{
  block: SiteBlock | SiteBlockRequest;
  context?: EditorialContext;
  onSave: (block: SiteBlock) => void | Promise<void>;
}> = props => {
  const latestPreview = useRef<SiteBlock | SiteBlockRequest | undefined>();
  const { saveChanges, editor, preview, canSubmit } = useBlockEditor(props.block, newBlock => (latestPreview.current = newBlock));
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
        Saved
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

  const { id: sourceId, type: sourceType } = props.source || {};

  // Step 1: Choose a block type (possibly filter based on current context)
  // - List all block types
  const blockTypes = useMemo(() => {
    return api.pageBlocks.getDefinitions(site.id, props.context);
  }, [api.pageBlocks, props.context, site.id]);

  const availableBlocks = useMemo(() => {
    return blockTypes.filter(block => {
      if (sourceId) {
        // We only want matching sources here.
        return block?.source?.id === sourceId && block?.source?.type === sourceType;
      }

      if (block?.source?.type === 'custom-page') {
        return block?.source.id === props.pagePath;
      }

      return !block.internal;
    });
  }, [blockTypes, props.pagePath, sourceId, sourceType]);

  const contextBlocks = useMemo(() => {
    const context = JSON.parse(JSON.stringify(props.context));
    return blockTypes.filter(block => {
      if (block?.anyContext?.some(b => Object.keys(context).indexOf(b) >= 0)) {
        return block;
      }
      return false;
    });
  }, [blockTypes, props.context]);

  const [filteredBlocks, setFilteredBlocks] = useState(availableBlocks);

  function handleFilter(e: string) {
    const result = availableBlocks
      ? availableBlocks.filter(block => block.label.toLowerCase().includes(e.toLowerCase()))
      : '';

    setFilteredBlocks(result ? result : []);
  }

  const pagePathBlocks = useMemo(() => {
    return blockTypes.filter(block => {
      if (block?.source?.type === 'custom-page' && props.pagePath) {
        return block?.source.id === props.pagePath;
      }
      return false;
    });
  }, [blockTypes, props.pagePath]);

  const pluginBlocks = useMemo(() => {
    return blockTypes.filter(block => {
      if (block?.source?.type === 'plugin') {
        return block?.source.id;
      }
      return false;
    });
  }, [blockTypes, props.pagePath]);

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
        <AddBlockIconWrapper>{Icon ? <Icon /> : <DefaultBlockIcon />}</AddBlockIconWrapper>
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
          <FilterInput type="text" onChange={e => handleFilter(e.target.value)} placeholder="Search all blocks" />
          <AddBlockList>{filteredBlocks.map(renderBlock)}</AddBlockList>
        </>
      ) : null}
    </>
  );
};
