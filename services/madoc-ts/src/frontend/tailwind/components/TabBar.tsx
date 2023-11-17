interface TabBarProps {
  tabs: {
    label: string;
  }[];
  current: number;
  onChange: (index: number) => void;
}

export function TabBar(props: TabBarProps) {
  return (
    <div>
      <ul className="flex border-b">
        {props.tabs.map((tab, k) => {
          return (
            <li key={k} className="-mb-px mr-1">
              <a
                className={`bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-700 font-semibold ${
                  k === props.current ? 'border-b-0' : 'border-b'
                }`}
                onClick={() => props.onChange(k)}
              >
                {tab.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
