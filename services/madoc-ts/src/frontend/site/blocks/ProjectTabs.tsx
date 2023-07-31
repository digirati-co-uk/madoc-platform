import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import styled from 'styled-components';
import { ProjectMyWorkTab } from '../features/project/ProjectMyWorkTab';
import { ProjectContentTab } from '../features/project/ProjectContentTab';
// import { ProjectContributorsTab } from './ProjectContributorsTab';

const TabContainer = styled.div`
  padding-top: 2em;
  display: flex;
  justify-content: flex-start;
  position: relative;
  &:after {
    height: 2px;
    background-color: #999;
    opacity: 0.5;
    content: '';
    width: 90%;
    position: absolute;
    bottom: 0;
    z-index: 0;
  }
`;

const Tab = styled.button`
  margin-right: 24px;
  font-size: 1em;
  font-weight: 500;
  border-radius: 5px;
  border: rgba(112, 112, 112, 0.05);
  background-color: transparent;
  color: #6b6b6b;
  cursor: pointer;
  position: relative;
  &:before {
    transition: all 100ms ease-in-out;
    content: '';
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
  }
  &[data-is-active='true'] {
    color: black;
    &:before {
      transition: all 100ms ease-in-out;
      background-color: #3498db;
      height: 2px;
    }
  }

  :hover {
  }
`;

const TabContent = styled.div`
  padding: 1em;
`;

export const ProjectTabs: React.FC = () => {
  const { t } = useTranslation();

  const [tab, setTab] = useState('1');

  const tabs = [
    {
      id: '1',
      title: 'My work',
      content: <ProjectMyWorkTab />,
    },
    {
      id: '2',
      title: 'Manifests and Collections',
      content: <ProjectContentTab />,
    },
    // {
    //   id: '3',
    //   title: 'Contributors',
    //   content: <ProjectContributorsTab />,
    // },
  ];

  const SelectedTab = tabs.find(tb => tb.id === tab);

  return (
    <>
      <TabContainer role="tablist">
        {tabs.map((tb, index) => {
          return (
            <Tab
              data-is-active={tab === tb.id}
              role="tab"
              aria-selected={tab === tb.id}
              key={index}
              id={tb.id}
              onClick={() => {
                setTab(tb.id);
              }}
            >
              {t(`${tb.title}`)}
            </Tab>
          );
        })}
      </TabContainer>
      <TabContent>{SelectedTab?.content}</TabContent>
    </>
  );
};

blockEditorFor(ProjectTabs, {
  type: 'default.ProjectTabs',
  label: 'Project tabs',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
