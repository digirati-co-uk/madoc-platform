import { RenderBlock } from '../../shared/page-blocks/render-block';
import { useSlots } from '../../shared/page-blocks/slot-context';
import { useAvailableBlocks } from '../../shared/page-blocks/use-available-blocks';
import { useRouteContext } from '../hooks/use-route-context';

export function BlocksPage() {
  const { context, pagePath } = useSlots();
  const {
    filteredBlocks,
    contextBlocks,
    pluginBlocks,
    searchBlocks,
    availableBlocks,
    pagePathBlocks,
  } = useAvailableBlocks({
    context,
    pagePath,
  });

  return (
    <div>
      {availableBlocks.map((block, k) => {
        return (
          <div key={k}>
            <h3>{block.type}</h3>
            <RenderBlock
              block={{
                type: block.type,
                id: k,
                static_data: {},
                name: block.label,
                lazy: false,
              }}
              context={context}
            />
          </div>
        );
      })}
    </div>
  );
}
