interface TableHeaderSvgProps {
  headerStart: number | null;
  headerEnd: number | null;
  netLeft: number;
  netRight: number;
  value: { width: number };
  headerFillColor: string;
  headerStrokeColor: string;
  headerColumnStrokeColor: string;
  showInteractiveNet: boolean;
  colStops: number[];
  toCanvasY: (y: number) => number;
  toCanvasX: (x: number) => number;
}

export function TableHeaderSvg({
  headerStart,
  headerEnd,
  netLeft,
  netRight,
  value,
  headerFillColor,
  headerStrokeColor,
  headerColumnStrokeColor,
  showInteractiveNet,
  colStops,
  toCanvasY,
  toCanvasX,
}: TableHeaderSvgProps) {
  if (headerStart == null || headerEnd == null) {
    return null;
  }

  const top = toCanvasY(headerStart);
  const bottom = toCanvasY(headerEnd);
  const height = bottom - top;
  if (height <= 0) {
    return null;
  }

  return (
    <>
      <rect x={netLeft} y={top} width={value.width} height={height} fill={headerFillColor} pointerEvents="none" />
      <line
        x1={netLeft}
        y1={bottom}
        x2={netRight}
        y2={bottom}
        stroke={headerStrokeColor}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        pointerEvents="none"
      />

      {showInteractiveNet
        ? colStops.slice(1, -1).map((position, index) => {
            const x = toCanvasX(position);
            return (
              <line
                key={`head-col-${index}`}
                x1={x}
                y1={top}
                x2={x}
                y2={bottom}
                stroke={headerColumnStrokeColor}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            );
          })
        : null}
    </>
  );
}
