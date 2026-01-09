import type { SVGProps } from "react";

interface SVGRProps {
  title: string;
  titleId?: string;
  enabled?: boolean;
  desc?: boolean;
}

export const SortIcon = ({
  title,
  titleId,
  desc,
  enabled,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => {
  const colourBottom = enabled && !desc;
  const colourTop = enabled && desc;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 -960 960 960"
      aria-labelledby={titleId}
      {...props}
    >
      <title id={titleId}>{title}</title>
      <path
        d="M480-120 300-300l58-58 122 122 122-122 58 58-180 180"
        style={{ fillOpacity: colourTop ? 1 : 0.5 }}
      />
      <path
        d="M358-598l-58-58 180-180 180 180-58 58-122-122-122 122Z"
        style={{ fillOpacity: colourBottom ? 1 : 0.5 }}
      />
    </svg>
  );
};
