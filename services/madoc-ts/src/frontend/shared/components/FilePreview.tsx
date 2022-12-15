import React, { useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { createDownload } from '../../../utility/create-download';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { EmptyState } from '../layout/EmptyState';

type SupportedFile = { type: string; value: string };

interface FilePreviewProps {
  fileName: string;
  showLines?: boolean;
  contentType?: string;
  children?: SupportedFile;
  lazyLoad?: () => Promise<SupportedFile | undefined | null> | undefined | SupportedFile | null;
}

const Container = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 5px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 0.875em;
  white-space: pre;
  max-height: 600px;

  & ~ & {
    margin-top: 10px;
  }
`;

const Header = styled.div`
  background: #f7f8fa;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  line-height: 1.9em;
  z-index: 3;
`;

const FileName = styled.div`
  color: #000;
  padding: 0.5em 1em;
  margin-right: auto;
`;

const DownloadButton = styled.button`
  margin: 10px;
`;

const Line = styled.span`
  background: #fff;
  display: flex;
  line-height: 1.3em;
  text-wrap: avoid;
  max-width: 100%;
  position: relative;
  white-space: pre-wrap;
  &:before {
    color: #999;
    text-align: right;
    margin-right: 0.5em;
    counter-increment: lines;
    content: counter(lines);
    width: 2em;
    min-width: 2em;
    user-select: none;
    display: block;
    z-index: 2;
    place-self: flex-start;
    background: #fff;
  }
  &:after {
    content: '';
    background: #eee;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 2em;
    z-index: 1;
  }
`;

const Body = styled.div`
  counter-reset: lines;
  min-width: 0;
`;

const Icon = styled.div`
  margin-left: 0.5em;
  padding: 0 0.2em;
  font-size: 1.2em;
  transform: translateY(2px);

  & ~ ${FileName}:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

export function FilePreview(props: FilePreviewProps) {
  const container = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const isLazy = !!props.lazyLoad;
  const { data, isFetched } = useQuery(
    ['lazy-loaded', { filename: props.fileName }],
    async () => {
      if (props.lazyLoad) {
        const d = await props.lazyLoad();
        setTimeout(() => container.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
        return d;
      }
    },
    { enabled: enabled && !!props.lazyLoad }
  );

  const lines = useMemo(() => {
    if (isLazy) {
      return data ? data.value.split('\n') : [];
    }
    return props.children ? props.children.value.split('\n') : [];
  }, [isLazy, data, props.children]);

  function toggle() {
    setEnabled(e => {
      if (!e) {
        setTimeout(() => container.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
      }
      return !e;
    });
  }

  return (
    <Container ref={container}>
      <Header>
        {props.lazyLoad ? (
          enabled ? (
            <Icon onClick={toggle}>
              <ArrowDownIcon />
            </Icon>
          ) : (
            <Icon onClick={toggle}>
              <ArrowDownIcon style={{ transform: 'rotate(-90deg)' }} />
            </Icon>
          )
        ) : null}
        <FileName onClick={toggle}>{props.fileName}</FileName>
        {!isLazy || (data && enabled) ? (
          <DownloadButton
            onClick={() =>
              createDownload(
                data || props.children,
                props.fileName.split('/').pop() || 'unknown.json',
                props.contentType as any
              )
            }
          >
            Download
          </DownloadButton>
        ) : null}
      </Header>
      {!isLazy || (data && enabled) ? (
        <Body>
          {lines.map((line, k) => (
            <Line key={k}>{line}</Line>
          ))}
        </Body>
      ) : null}
      {props.lazyLoad && isFetched && !data && enabled ? <EmptyState $noMargin>No file found</EmptyState> : null}
    </Container>
  );
}
