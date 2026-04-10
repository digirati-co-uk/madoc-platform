export type TabularProjectTemplateConfig = {
  enableZoomTracking?: boolean;
  iiif?: {
    manifestId?: string;
    canvasId?: string;
  };
  tabular: {
    structure: {
      topLeft: {
        x: number;
        y: number;
      };
      topRight: {
        x: number;
        y: number;
      };
      marginsPct: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
      columnCount: number;
      columnWidthsPctOfPage: number[];
      rowHeightsPctOfPage: number[];
      rowOffsetAdjustments?: Array<{
        startRow: number;
        offsetPctOfPage: number;
      }>;
      blankColumnIndexes?: number[];
    };
    model?: {
      columns: Array<{
        id?: string;
        label?: string;
        type?: string;
        fieldType?: string;
        helpText?: string;
        saved?: boolean;
      }>;
      captureModelFields?: Record<
        string,
        {
          type?: string;
          label?: string;
          description?: string;
        }
      >;
      captureModelTemplate?: Record<string, unknown>;
    };
  };
};
