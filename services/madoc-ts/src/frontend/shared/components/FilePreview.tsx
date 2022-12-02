import React, { useMemo } from 'react';
import styled from 'styled-components';
import { createDownload } from '../../../utility/create-download';
import { globalFontMono } from '../variables';

interface FilePreviewProps {
  fileName: string;
  showLines?: boolean;
  contentType?: string;
  children: string;
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
`;

const Header = styled.div`
  background: #f7f8fa;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
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
  &:before {
    color: #999;
    text-align: right;
    margin-right: 0.5em;
    counter-increment: lines;
    content: counter(lines);
    width: 2em;
    user-select: none;
    display: block;
  }
`;

const Body = styled.div`
  counter-reset: lines;
`;

export function FilePreview(props: FilePreviewProps) {
  const lines = useMemo(() => {
    return props.children.split('\n');
  }, [props.children]);

  return (
    <Container>
      <Header>
        <FileName>{props.fileName}</FileName>
        <DownloadButton
          onClick={() =>
            createDownload(props.children, props.fileName.split('/').pop() || 'unknown.json', props.contentType)
          }
        >
          Download
        </DownloadButton>
      </Header>
      <Body>
        {lines.map((line, k) => (
          <Line key={k}>{line}</Line>
        ))}
      </Body>
    </Container>
  );
}
