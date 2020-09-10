import * as React from 'react';
import styled from 'styled-components';
import {
  KanbanAssignee,
  KanbanBoard,
  KanbanBoardContainer,
  KanbanCard,
  KanbanCardButton,
  KanbanCardInner, KanbanCardTextButton,
  KanbanCol,
  KanbanColTitle,
  KanbanLabel,
  KanbanType,
} from '../src/frontend/shared/atoms/Kanban';

export default { title: 'Kanban' };

const DemoPage = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  height: 100%;
  min-height: 100vh;
`;

export const readOnlyBoard: React.FC = () => {
  return (
    <DemoPage>
      <KanbanBoard>
        <KanbanBoardContainer>
          <KanbanCol>
            <KanbanColTitle>Waiting for contributor</KanbanColTitle>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
          </KanbanCol>
          <KanbanCol>
            <KanbanColTitle>Waiting for contributor</KanbanColTitle>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
              <KanbanCardButton>view contribution</KanbanCardButton>
            </KanbanCard>
            <KanbanCard>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
              <KanbanCardTextButton>view contribution</KanbanCardTextButton>
            </KanbanCard>
          </KanbanCol>
          <KanbanCol>
            <KanbanColTitle>Completed reviews</KanbanColTitle>
            <KanbanCard $disabled>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
            <KanbanCard $disabled>
              <KanbanCardInner>
                <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                <KanbanType>Crowdsourcing task</KanbanType>
              </KanbanCardInner>
              <KanbanAssignee>
                {Math.random()
                  .toString(36)
                  .substr(2, 15)}
              </KanbanAssignee>
            </KanbanCard>
          </KanbanCol>
        </KanbanBoardContainer>
      </KanbanBoard>
    </DemoPage>
  );
};
