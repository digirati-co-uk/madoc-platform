import { Header } from "@tanstack/react-table";
import { SortIcon } from "../icons/SortIcon";

interface SortableTableHeaderProps {
  children: React.ReactNode;
  header: Header<any, any>,
}

export function SortableTableHeader(props: SortableTableHeaderProps) {
  return (
    <span className="flex items-center justify-between">
      {props.children}

      {props.header.column.getCanSort() && (
        <SortIcon
          className="text-2xl"
          title="Sort by"
          desc={props.header.column.getIsSorted() === 'desc'}
          enabled={props.header.column.getIsSorted() !== false}
        />
      )}
    </span>
  );
}
