import { useEffect, useRef } from 'react';
import { useEvent, useRequestAnnotation } from 'react-iiif-vault';
import { BoxSelectorProps } from '../BoxSelector';

type BoxState = BoxSelectorProps['state'];

function pointsToBox(points: Array<any>): BoxState {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }

  const numericPoints: Array<[number, number]> = [];
  for (const point of points) {
    if (Array.isArray(point) && point.length >= 2) {
      const x = point[0];
      const y = point[1];
      if (typeof x === 'number' && typeof y === 'number') {
        numericPoints.push([x, y]);
      }
    }
  }

  if (!numericPoints.length) {
    return null;
  }

  let minX = numericPoints[0][0];
  let maxX = numericPoints[0][0];
  let minY = numericPoints[0][1];
  let maxY = numericPoints[0][1];

  for (const [x, y] of numericPoints) {
    if (x < minX) {
      minX = x;
    }
    if (x > maxX) {
      maxX = x;
    }
    if (y < minY) {
      minY = y;
    }
    if (y > maxY) {
      maxY = y;
    }
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export interface CreateCustomBoxProps {
  box: BoxState;
  onSave: (box: NonNullable<BoxState>) => void;
}

export function CreateCustomBox(props: CreateCustomBoxProps) {
  const initialBoxRef = useRef<BoxState>(props.box || null);
  const previousBoxRef = useRef<BoxState>(props.box || null);
  const requestedForIdRef = useRef<string | null>(null);
  const { requestId, requestAnnotation, cancelRequest } = useRequestAnnotation();
  const requestAnnotationRef = useRef(requestAnnotation);
  const cancelRequestRef = useRef(cancelRequest);

  useEffect(() => {
    requestAnnotationRef.current = requestAnnotation;
  }, [requestAnnotation]);

  useEffect(() => {
    cancelRequestRef.current = cancelRequest;
  }, [cancelRequest]);

  useEffect(() => {
    const hadBox = !!previousBoxRef.current;
    const hasBox = !!props.box;
    if (hadBox && !hasBox) {
      cancelRequestRef.current();
      requestedForIdRef.current = null;
    }
    previousBoxRef.current = props.box || null;

    if (!requestedForIdRef.current) {
      initialBoxRef.current = props.box || null;
    }
  }, [props.box]);

  useEffect(() => {
    if (!requestId || requestedForIdRef.current === requestId) {
      return;
    }
    requestedForIdRef.current = requestId;

    void requestAnnotationRef.current(
      {
        type: 'box',
        selector: initialBoxRef.current || null,
      },
      { toolId: 'box' }
    );

    return () => {
      cancelRequestRef.current();
    };
  }, [requestId]);

  useEvent<any, any>(
    'atlas.polygon-update' as any,
    data => {
      if (requestId && data.id && data.id !== requestId) {
        return;
      }
      const box = pointsToBox(data.points || []);
      if (box) {
        props.onSave(box);
      }
    },
    [props.onSave, requestId]
  );

  return null;
}
