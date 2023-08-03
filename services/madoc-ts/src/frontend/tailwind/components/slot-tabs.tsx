import { Children, ReactNode, useEffect, useState } from 'react';
import { AvailableBlocks } from '../../shared/page-blocks/available-blocks';
import { Slot } from '../../shared/page-blocks/slot';
import { useSlots } from '../../shared/page-blocks/slot-context';

interface SlotTabProps {
  initial?: string;
  disableHash?: boolean;
  children?: any;
}
export function SlotTabs(props: SlotTabProps) {
  const initialTab = typeof window !== 'undefined' && !props.disableHash ? window.location.hash.replace('#', '') : null;
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

  const initial = initialTab || props.initial;

  const initialIndex = tabs.find(tab => (initial ? tab.name === initial : null));

  const [active, setActive] = useState(initialIndex?.index || tabs[0]?.index || 0);

  const selected = tabs.find(tab => tab.index === active);

  useEffect(() => {
    if (typeof window !== 'undefined' && !props.disableHash) {
      const listener = () => {
        const hash = window.location.hash.replace('#', '');
        const tab = tabs.find(t => t.name === hash);
        if (tab) {
          setActive(tab.index);
        }
      };
      window.addEventListener('hashchange', listener);
      return () => {
        window.removeEventListener('hashchange', listener);
      };
    }
  }, []);

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
              onClick={() => {
                setActive(tab.index);
                if (typeof window !== 'undefined' && !props.disableHash) {
                  window.location.hash = tab.name;
                }
              }}
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
