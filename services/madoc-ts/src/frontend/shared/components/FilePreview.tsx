import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { createDownload } from '../../../utility/create-download';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { EmptyState } from '../layout/EmptyState';
import { isCsvFile } from '../utility/csv-preview';
import { CsvPreview } from './CsvPreview';

interface SupportedFile {
  type: string;
  value: string;
  contentType?: string;
}

interface FilePreviewProps {
  fileName: string;
  showLines?: boolean;
  download?: boolean;
  preFetch?: boolean;
  contentType?: string;
  children?: SupportedFile;
  lazyLoad?: () => Promise<SupportedFile | undefined | null> | undefined | SupportedFile | null;
}

export function FilePreview(props: FilePreviewProps) {
  const [enabled, setEnabled] = useState(false);
  const isLazy = !!props.lazyLoad;
  const { data, isFetched } = useQuery(
    ['lazy-loaded', { filename: props.fileName }],
    async () => {
      if (props.lazyLoad) {
        return props.lazyLoad();
      }
    },
    { enabled: (enabled || props.preFetch) && !!props.lazyLoad }
  );
  const file = isLazy ? data : props.children;
  const isCsv = isCsvFile(props.fileName, props.contentType, file?.contentType, file?.type);
  const lines = useMemo(() => (isCsv ? [] : file?.value.split('\n') || []), [isCsv, file]);

  function toggle() {
    setEnabled(e => !e);
  }

  return (
    <div className="file-preview max-h-[600px] min-w-0 max-w-full overflow-auto whitespace-pre rounded-[5px] border border-[#eee] bg-white font-mono text-[0.875em] [&~.file-preview]:mt-[10px]">
      <div className="sticky top-0 z-[3] flex items-center bg-[#f7f8fa] leading-[1.9em]">
        {isLazy ? (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={enabled}
            className="group flex min-w-0 flex-1 items-center text-left text-black"
          >
            <span className="ml-[0.5em] translate-y-[2px] px-[0.2em] text-[1.2em]">
              <ArrowDownIcon className={enabled ? undefined : '-rotate-90'} />
            </span>
            <span className="mr-auto px-[1em] py-[0.5em] group-hover:underline">{props.fileName}</span>
          </button>
        ) : (
          <div className="mr-auto px-[1em] py-[0.5em] text-black">{props.fileName}</div>
        )}
        {(!isLazy || (data && (enabled || props.preFetch))) && props.download !== false ? (
          <button
            type="button"
            className="m-[10px]"
            onClick={() =>
              createDownload(
                file?.value || '',
                props.fileName.split('/').pop() || 'unknown.json',
                props.contentType || file?.contentType
              )
            }
          >
            Download
          </button>
        ) : null}
      </div>
      {!isLazy || (data && enabled) ? (
        isCsv ? (
          <CsvPreview fileName={props.fileName} value={file?.value || ''} />
        ) : (
          <div className="min-w-0 [counter-reset:lines]">
            {lines.map((line, k) => (
              <span
                key={k}
                className="relative flex max-w-full whitespace-pre-wrap bg-white leading-[1.3em] before:z-[2] before:mr-[0.5em] before:block before:w-[2em] before:min-w-[2em] before:select-none before:place-self-start before:bg-white before:text-right before:text-[#999] before:content-[counter(lines)] before:[counter-increment:lines] after:absolute after:inset-y-0 after:left-0 after:z-[1] after:w-[2em] after:bg-[#eee] after:content-['']"
              >
                {line}
              </span>
            ))}
          </div>
        )
      ) : null}
      {props.lazyLoad && isFetched && !data && enabled ? <EmptyState $noMargin>No file found</EmptyState> : null}
    </div>
  );
}
