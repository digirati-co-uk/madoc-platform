import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useNavigation } from '../capture-models/editor/hooks/useNavigation';
import { Revisions } from '../capture-models/editor/stores/revisions/index';
import { StatusTypes } from '../capture-models/types/capture-model';
import { RevisionRequest } from '../capture-models/types/revision-request';
import { useBrowserLayoutEffect } from '../hooks/use-browser-layout-effect';
import { SmallButton } from '../navigation/Button';
import { ViewDocument } from '../capture-models/inspector/ViewDocument';
import { useContributors } from '../capture-models/new/components/ContributorContext';
import { useSelectorHelper } from '../capture-models/editor/stores/selectors/selector-helper';
import { resolveSelector } from '../capture-models/helpers/resolve-selector';
import { useDecayState } from '../hooks/use-decay-state';
import { useApiCaptureModel } from '../hooks/use-api-capture-model';

const RevisionListContainer = styled.div`
  padding: 10px;
`;

const RevisionListItemContainer = styled.div<{ $selected?: boolean }>`
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0.5em;
  display: flex;
  flex-wrap: wrap;
  box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.05);
  outline: 3px solid transparent;
  transition: outline-color 1s;
  & ~ & {
    margin-top: 0.5em;
  }

  ${props =>
    props.$selected &&
    css`
      box-shadow: 0 0 0 3px #4a67e4;
      border-color: #fff;
    `}
`;

const RevisionHeading = styled.div`
  flex: 1 1 0px;
`;

const RevisionActions = styled.div``;

const RevisionLabel = styled.div`
  font-weight: bold;
`;

const RevisionListTitle = styled.div`
  text-transform: uppercase;
  font-size: 0.65em;
  color: #666;
  margin-bottom: 1em;
  font-weight: 600;
`;

const statusColours: { [key in StatusTypes]: string } = {
  accepted: '#337c34',
  draft: '#4a67e4',
  submitted: '#ffc63f',
  rejected: '#a90e21',
};

const RevisionStatus = styled.div<{ $status?: RevisionRequest['revision']['status'] }>`
  background: ${props => (props.$status ? statusColours[props.$status] : '#eee')};
  width: 4px;
  margin-right: 0.5em;
`;

const RevisionAuthor = styled.div`
  color: #999;
  font-size: 0.85em;
`;

const RevisionPreviewContainer = styled.div<{ $collapsed?: boolean }>`
  margin-top: 0.5em;
  padding-top: 0.5em;
  border-top: 1px solid #eee;
  min-width: 100%;
  position: relative;

  ${props =>
    props.$collapsed &&
    css`
      cursor: pointer;
      opacity: 0.5;
      max-height: 100px;
      overflow: hidden;
      transition: max-height 0.2s;
      &:hover {
        opacity: 0.9;
        max-height: 200px;
      }
      & * {
        pointer-events: none;
      }
      &:after {
        content: '';
        background: linear-gradient(0deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
        z-index: 2;
        position: absolute;
        bottom: 0;
        height: 30px;
        left: 0;
        right: 0;
      }
      &:hover:after {
        background: linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
      }
    `}
`;

export const RevisionListItem: React.FC<{ revision: RevisionRequest; editable?: boolean; onClick?: () => void }> = ({
  revision: rev,
  editable,
  onClick,
}) => {
  const outerDiv = useRef<HTMLDivElement>(null);
  const innerDiv = useRef<HTMLDivElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const contributors = useContributors();
  const author = rev.revision.authors && contributors ? contributors[rev.revision.authors[0]]?.name || '' : '';
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const selectRevision = Revisions.useStoreActions(a => a.selectRevision);
  const [, { goTo }] = useNavigation();

  useBrowserLayoutEffect(() => {
    if (outerDiv.current && innerDiv.current) {
      const { height: h1 } = outerDiv.current.getBoundingClientRect();
      const { height: h2 } = innerDiv.current.getBoundingClientRect();
      if (h1 >= h2) {
        setIsCollapsed(false);
      }
    }
  }, []);

  return (
    <RevisionListItemContainer $selected={currentRevisionId === rev.revision.id}>
      <RevisionStatus $status={rev.revision.status} />
      <RevisionHeading>
        <RevisionLabel>{rev.revision.label === 'Default' ? rev.document.label : rev.revision.label}</RevisionLabel>
        {author ? <RevisionAuthor>{author}</RevisionAuthor> : <span style={{ color: '#999' }}>unknown</span>}
      </RevisionHeading>
      <RevisionActions>
        {currentRevisionId === rev.revision.id || (!editable && !onClick) ? null : (
          <SmallButton
            onClick={() => {
              if (onClick) {
                onClick();
              } else {
                if (rev.revision.structureId) {
                  goTo(rev.revision.structureId);
                }
                selectRevision({ revisionId: rev.revision.id });
              }
            }}
          >
            Edit
          </SmallButton>
        )}
      </RevisionActions>
      <RevisionPreviewContainer ref={outerDiv} $collapsed={isCollapsed} onClick={() => setIsCollapsed(false)}>
        <div ref={innerDiv}>
          <ViewDocument
            fluidImage
            document={rev.document}
            padding={false}
            hideTitle
            highlightRevisionChanges={rev.revision.id}
          />
        </div>
      </RevisionPreviewContainer>
    </RevisionListItemContainer>
  );
};

export const RevisionList: React.FC<{
  revisions: RevisionRequest[];
  editable?: boolean;
  title?: string;
  onClick?: (revision: string) => void;
}> = ({ revisions, editable, title, onClick }) => {
  return (
    <RevisionListContainer>
      {title && revisions.length ? <RevisionListTitle>{title}</RevisionListTitle> : null}
      {revisions.map(rev => {
        return (
          <RevisionListItem
            key={rev.revision.id}
            onClick={onClick ? () => onClick(rev.revision.id) : undefined}
            editable={editable}
            revision={rev}
          />
        );
      })}
    </RevisionListContainer>
  );
};
