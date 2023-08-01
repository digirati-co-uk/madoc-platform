import { Children, ReactNode, useState } from 'react';
import { AvailableBlocks } from '../../shared/page-blocks/available-blocks';
import { Slot } from '../../shared/page-blocks/slot';
import { useSlots } from '../../shared/page-blocks/slot-context';

interface SlotTabProps {
  initial?: string;
  children?: any;
}
export function SlotTabs(props: SlotTabProps) {
  const { slots, editable } = useSlots();
  const tabs = Children.map(props.children, (child, idx) => {
    if (!child) {
      return null;
    }
    if ((child as any).type === Slot) {
      const label = (child as any).props.label;
      const name = (child as any).props.name;
      const hidden = (child as any).props.hidden;
      if (!name) {
        return null;
      }

      const slot = slots[name];

      const children = (child as any).props.children;
      const isChildrenEmpty =
        !children ||
        Children.toArray(children).filter((c: any) => {
          return c.type !== AvailableBlocks;
        }).length === 0;

      const empty = slot ? slot?.blocks.length === 0 : isChildrenEmpty;

      const customLabel = slot?.props?.surface?.label;

      return {
        index: idx,
        hidden,
        name,
        empty,
        label: customLabel || label || name,
        component: child,
      };
    }
    return null;
  })?.filter((t: any) => {
    if (!t) {
      return false;
    }
    if (editable) {
      return true;
    }
    if (t.hidden) {
      return false;
    }
    return !t.empty;
  }) as { name: string; label: string; empty: boolean; hidden: boolean; index: number; component: ReactNode }[];

  const initialIndex = tabs.find(tab => (props.initial ? tab.name === props.initial : null));

  const [active, setActive] = useState(initialIndex?.index || tabs[0]?.index || 0);

  const selected = tabs.find(tab => tab.index === active);

  if (tabs.length === 1) {
    return (selected?.component || null) as any;
  }

  return (
    <>
      <div className="flex border-b border-slate-300 gap-2 my-10">
        {tabs?.map((tab, k) => {
          if ((tab.empty || tab.hidden) && !editable) {
            return null;
          }

          return (
            <button
              role="tab"
              key={k}
              onClick={() => setActive(tab.index)}
              className={`px-2 border-b-2 hover:border-blue-400 ${
                tab.index === active ? 'text-slate-800 border-blue-500' : 'text-slate-500 border-transparent'
              } ${tab.empty ? 'text-slate-400' : 'text-slate-900'}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {selected?.component || null}
    </>
  );
}
