import React from 'react';
import { Outlet } from 'react-router-dom';

import { TopicIndexWrapper, TopicsIndex } from './TopicsIndex';
import { ManageTopicTypes } from './manage-topic-types';
import { ManageTopics } from './manage-topics';

import { CreateNewTopicType } from './topic-type/create-new-topic-type';
import { DeleteTopicType } from './topic-type/delete-topic-type';
import { ListAllTopicTypes } from './topic-type/list-all-topic-types';
import { ListTopicResources } from './topic/list-topic-resources';
import { ManageTopic } from './topic/manage-topic';
import { TopicDetails } from './topic/topic-details';
import { EditTopic } from './topic/edit-topic';

import { CreateNewTopic } from './topic/create-new-topic';
import { DeleteTopic } from './topic/delete-topic';
import { ManageType } from './topic-type/manage-type';
import { EditTopicType } from './topic-type/edit-topic-type';
import { ListTopicsInType } from './topic-type/list-topics-in-type';
import { ListAllTopics } from './topic/list-all-topics';

export const topicRoutes = [
  {
    path: '/topics',
    element: <TopicIndexWrapper />,
    children: [
      {
        path: '/topics',
        index: true,
        element: <TopicsIndex />,
      },
      {
        path: '/topics/_/create-type',
        exact: true,
        element: <CreateNewTopicType />,
      },
      {
        path: '/topics/_/create-topic',
        exact: true,
        element: <CreateNewTopic />,
      },
    ],
  },
  {
    path: '/topics/types',
    element: <ManageTopicTypes />,
    children: [
      {
        path: '/topics/types',
        index: true,
        element: <ListAllTopicTypes />,
      },
      {
        path: '/topics/types/_/create-type',

        element: <CreateNewTopicType />,
      },
    ],
  },
  {
    path: '/topics/all',
    element: <ManageTopics />,
    children: [
      {
        path: '/topics/all',
        index: true,
        element: <ListAllTopics />,
      },
      {
        path: '/topics/all/_/create-topic',
        exact: true,
        element: <CreateNewTopic />,
      },
    ],
  },

  {
    path: '/topics/:topicType',
    element: <ManageType />,
    children: [
      {
        path: '/topics/:topicType',
        index: true,
        element: <ListTopicsInType />,
      },
      {
        path: '/topics/:topicType/_/edit',
        index: true,
        element: <EditTopicType />,
      },
      {
        path: '/topics/:topicType/_/create-topic',
        exact: true,
        element: <CreateNewTopic />,
      },
      {
        path: '/topics/:topicType/_/delete',
        exact: true,
        element: <DeleteTopicType />,
      },
    ],
  },
  {
    path: '/topics/:topicType/:topic',
    element: <ManageTopic />,
    children: [
      {
        path: '/topics/:topicType/:topic',
        index: true,
        element: <TopicDetails />,
      },
      {
        path: '/topics/:topicType/:topic/items',
        element: <ListTopicResources />,
        index: true,
      },
      {
        path: '/topics/:topicType/:topic/_/edit',
        index: true,
        element: <EditTopic />,
      },
      {
        path: '/topics/:topicType/:topic/delete',
        exact: true,
        element: <DeleteTopic />,
      },
    ],
  },
];

export function TopicsWrapper() {
  return <Outlet />;
}
