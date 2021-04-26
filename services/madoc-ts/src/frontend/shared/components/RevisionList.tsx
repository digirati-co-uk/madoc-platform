import { Revisions, useNavigation } from '@capture-models/editor';
import { RevisionRequest, StatusTypes } from '@capture-models/types';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { SmallButton } from '../atoms/Button';
import { ViewDocument } from '../caputre-models/inspector/ViewDocument';
import { useContributors } from '../caputre-models/new/components/ContributorContext';

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

const statusColours: { [key in StatusTypes]: string } = {
  accepted: '#ccc',
  draft: '#ffc63f',
  submitted: '#337c34',
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

export const RevisionListItem: React.FC<{ revision: RevisionRequest; editable?: boolean }> = ({
  revision: rev,
  editable,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const contributors = useContributors();
  const author = rev.revision.authors && contributors ? contributors[rev.revision.authors[0]]?.name || '' : '';
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const selectRevision = Revisions.useStoreActions(a => a.selectRevision);
  const [, { goTo }] = useNavigation();

  return (
    <RevisionListItemContainer $selected={currentRevisionId === rev.revision.id}>
      <RevisionStatus $status={rev.revision.status} />
      <RevisionHeading>
        <RevisionLabel>{rev.revision.label === 'Default' ? rev.document.label : rev.revision.label}</RevisionLabel>
        {author ? <RevisionAuthor>{author}</RevisionAuthor> : null}
      </RevisionHeading>
      <RevisionActions>
        {currentRevisionId === rev.revision.id || !editable ? null : (
          <SmallButton
            onClick={() => {
              if (rev.revision.structureId) {
                goTo(rev.revision.structureId);
              }
              selectRevision({ revisionId: rev.revision.id });
            }}
          >
            Edit
          </SmallButton>
        )}
      </RevisionActions>
      <RevisionPreviewContainer $collapsed={isCollapsed} onClick={() => setIsCollapsed(false)}>
        <ViewDocument document={rev.document} padding={false} hideTitle highlightRevisionChanges={rev.revision.id} />
      </RevisionPreviewContainer>
    </RevisionListItemContainer>
  );
};

export const RevisionList: React.FC<{ revisions: RevisionRequest[]; editable?: boolean }> = ({
  revisions,
  editable,
}) => {
  return (
    <RevisionListContainer>
      {revisions.map(rev => {
        return <RevisionListItem key={rev.revision.id} editable={editable} revision={rev} />;
      })}
    </RevisionListContainer>
  );
};
