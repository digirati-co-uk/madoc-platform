import { useState } from 'react';
import * as React from 'react';
import styled, { css } from 'styled-components';
import { StatusIcon, StatusWrapper } from '../../src/frontend/shared/atoms/Status';
import { TaskListContainer, TaskListInnerContainer } from '../../src/frontend/shared/atoms/TaskList';
import { TaskItem } from '../../src/frontend/shared/components/TaskItem';
import { TaskTabBackground, TaskTabItem, TaskTabRow } from '../../src/frontend/shared/components/TaskTabs';
import { HrefLink } from '../../src/frontend/shared/utility/href-link';

export default { title: 'Legacy/Tasks' };

export const TasksOverview = () => {
  return <div>All variations of tasks.</div>;
};

export const SingleTaskSnippet = () => {
  return (
    <>
      <div style={{ width: 350, margin: '4em auto' }}>
        <TaskItem
          label="Aberdeenshire"
          type="manifest task"
          status={0}
          user={{ name: 'stephen', link: '#' }}
          thumbnail="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg"
        />
        <TaskItem
          label="Aberdeenshire"
          type="manifest task"
          status={1}
          user={{ name: 'stephen', link: '#' }}
          thumbnail="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg"
        />
        <TaskItem
          label="Aberdeenshire"
          type="manifest task"
          status={2}
          user={{ name: 'stephen', link: '#' }}
          thumbnail="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg"
        />
        <TaskItem
          label="Aberdeenshire"
          type="manifest task"
          status={3}
          user={{ name: 'stephen', link: '#' }}
          thumbnail="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg"
        />
        <TaskListContainer>
          <TaskListInnerContainer>
            <TaskItem
              $onDark
              label="Aberdeenshire"
              type="manifest task"
              status={0}
              user={{ name: 'stephen', link: '#' }}
              thumbnail="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg"
            />

            <TaskItem
              $onDark
              label="Aberdeenshire with a very long title that should get cropped"
              type="manifest task"
              status={1}
              user={{ name: 'stephen', link: '#' }}
              thumbnail="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg"
            />
            <TaskItem
              $onDark
              label="Aberdeenshire"
              type="manifest task"
              status={2}
              user={{ name: 'stephen', link: '#' }}
              thumbnail="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg"
            />

            <TaskItem
              $onDark
              label="Aberdeenshire with a very long title that should get cropped"
              type="manifest task"
              status={3}
              user={{ name: 'stephen', link: '#' }}
              thumbnail="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg"
            />

            <TaskItem
              $onDark
              label="Aberdeenshire with a very long title that should get cropped"
              type="manifest task"
              status={4}
              user={{ name: 'stephen', link: '#' }}
              thumbnail="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg"
            />
          </TaskListInnerContainer>
        </TaskListContainer>
      </div>
    </>
  );
};

const TaskHeaderContainer = styled.div`
  background: #fff;
  padding: 0.5em;
  display: flex;
`;

const TaskHeaderThumbnail = styled.div`
  width: 4.2em;
  height: 4.2em;
  border-radius: 3px;
  overflow: hidden;

  img {
    width: 4.2em;
    height: 4.2em;
    object-fit: cover;
    object-position: 50% 50%;
  }
`;

const TaskHeaderContent = styled.div`
  flex: 1 1 0px;
  min-width: 0;
  margin: 0 0.75em;
`;

const TaskHeaderLabel = styled.div`
  font-size: 1.3em;
`;

const TaskHeaderSubHeading = styled.div`
  font-size: 0.75em;
  color: #444;
`;

const TaskHeaderCreated = styled.span`
  color: #bbb;
`;

const TaskHeaderActions = styled.div`
  display: flex;
  color: #999;
  margin-top: 0.5em;
  font-size: 0.85em;

  a {
    color: #4a67e4;
    text-decoration: underline;
  }
`;

const TaskHeaderAction = styled.div`
  padding: 0.25em 1em 0.25em 0;

  & ~ & {
    padding-left: 1em;
    border-left: 1px solid #eee;
  }
`;

const TaskHeaderStatus = styled.div`
  align-self: start;
  font-size: 0.85em;
`;

const TaskHeaderStatusText = styled.div`
  font-size: 0.85em;
`;

export const TaskTabsExample: React.FC = () => {
  const [k, setK] = useState(0);
  return (
    <TaskTabBackground>
      <TaskTabRow>
        <TaskTabItem $active={k === 0} onClick={() => setK(0)}>
          Tasks UI
        </TaskTabItem>
        <TaskTabItem $active={k === 1} onClick={() => setK(1)}>
          Details
        </TaskTabItem>
        <TaskTabItem $active={k === 2} onClick={() => setK(2)}>
          Subtasks (10)
        </TaskTabItem>
        <TaskTabItem $active={k === 3} onClick={() => setK(3)}>
          Linked tasks
        </TaskTabItem>
        <TaskTabItem $active={k === 4} onClick={() => setK(4)}>
          Manage
        </TaskTabItem>
      </TaskTabRow>
    </TaskTabBackground>
  );
};

export const TaskHeaderExample: React.FC = () => {
  return (
    <>
      <TaskHeaderContainer>
        <TaskHeaderThumbnail>
          <img src="https://view.nls.uk/iiif/7442/74420086.5/full/256,/0/default.jpg" />
        </TaskHeaderThumbnail>
        <TaskHeaderContent>
          <TaskHeaderLabel>Review of “Aberdeenshire - 1”</TaskHeaderLabel>
          <TaskHeaderSubHeading>
            crowdsourcing review <TaskHeaderCreated>created 5 days ago</TaskHeaderCreated>
          </TaskHeaderSubHeading>
          <TaskHeaderActions>
            <TaskHeaderAction>
              <HrefLink>View resource</HrefLink>
            </TaskHeaderAction>
            <TaskHeaderAction>
              <HrefLink>View manifest</HrefLink>
            </TaskHeaderAction>
            <TaskHeaderAction>
              assigned to <HrefLink>admin</HrefLink>
            </TaskHeaderAction>
          </TaskHeaderActions>
        </TaskHeaderContent>
        <TaskHeaderStatus>
          <StatusWrapper>
            <StatusIcon status={1} />
            <TaskHeaderStatusText>accepted</TaskHeaderStatusText>
          </StatusWrapper>
        </TaskHeaderStatus>
      </TaskHeaderContainer>
      <TaskTabsExample />
    </>
  );
};
