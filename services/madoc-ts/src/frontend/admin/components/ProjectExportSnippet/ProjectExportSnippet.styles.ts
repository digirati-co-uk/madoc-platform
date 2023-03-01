import styled, { css } from 'styled-components';

const Container = styled.div<{ $flex?: boolean }>`
  background: #ffffff;
  border: 1px solid #cdcdcd;
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  padding: 1em;
  container-type: inline-size;

  ${props =>
    props.$flex &&
    css`
      display: flex;
      justify-content: space-between;
      box-shadow: none;
      border: none;
      border-radius: 0;

      ${Progress} {
        font-size: 0.5em;
      }
    `}
`;

const TitleSection = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto;
  grid-column-gap: 1em;
  grid-template-areas:
    'title    action'
    'subtitle action'
    'progress progress';
`;

const Title = styled.div`
  grid-area: title;
  font-size: 1.1em;
`;

const Subtitle = styled.div`
  font-size: 0.9em;
  grid-area: subtitle;
  color: #666;
`;

const TagList = styled.div`
  margin: 0.5em 0;
  font-size: 0.8em;
  display: flex;
  flex-wrap: nowrap;
  border-radius: 5px;
  overflow: hidden;
  z-index: 1;
  max-width: 400px;
  &:hover {
    overflow: visible;
  }
`;

const Tag = styled.div`
  background: #fff;
  border: 1px solid #999;
  color: #555;
  padding: 0.2em 0.5em;
  border-radius: 3px;
  margin: 0.2em;
  align-self: center;
  white-space: nowrap;
`;

const DownloadBox = styled.div`
  background: #ddd;
  display: flex;
  border-radius: 3px;
  place-self: center;
`;

const DownloadLabel = styled.div`
  flex: 1;
  align-self: center;
  padding: 0 0.5em;
  font-size: 0.9em;
`;

const ViewTask = styled.div`
  grid-area: action;
  align-self: center;
  font-size: 0.9em;
`;

const Progress = styled.div`
  grid-area: progress;
  min-width: 100px;
`;

export const ProjectExportSnippetStyles = {
  Container,
  TitleSection,
  Title,
  Subtitle,
  TagList,
  Tag,
  DownloadBox,
  DownloadLabel,
  ViewTask,
  Progress,
};
