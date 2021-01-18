import React, { useMemo } from 'react';
import { EditorialContext, SiteBlock, SiteBlockRequest } from '../../../types/schemas/site-page';
import { WarningMessage } from '../atoms/WarningMessage';
import { useApi } from '../hooks/use-api';
import { BlockEditor } from './block-editor';

type RenderBlockProps = {
  block: SiteBlock | SiteBlockRequest;
  context?: EditorialContext;
  editable?: boolean;
  showWarning?: boolean;
  onUpdateBlock?: (id: number) => void;
};

export const RenderBlock: React.FC<RenderBlockProps> = props => {
  const api = useApi();

  const blockContents = useMemo(() => {
    return api.pageBlocks.renderBlockToReact(props.block, props.context || {});
  }, [api, props.block, props.context]);

  if (props.editable) {
    if (!blockContents) {
      if (props.showWarning) {
        return <WarningMessage>Unable to render this block: {props.block.name}</WarningMessage>;
      }
      return null;
    }

    return (
      <BlockEditor block={props.block as SiteBlock} context={props.context} onUpdateBlock={props.onUpdateBlock}>
        {blockContents}
      </BlockEditor>
    );
  }

  return blockContents;
};
