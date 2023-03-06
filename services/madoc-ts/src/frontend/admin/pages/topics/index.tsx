import React from 'react';
import { Outlet } from 'react-router-dom';
import { CreateNewTopic } from './create-new-topic';
import { CreateNewTopicType } from './create-new-topic-type';
import { DeleteTopic } from './delete-topic';
import { DeleteTopicType } from './delete-topic-type';
import { ListTopicItems } from './list-topic-items';
import { ListTopicTypes } from './list-topic-types';
import { ManageTopicType } from './manage-topic-type';
import { ManageTopicTypes } from './manage-topic-types';
import { ManageTopic } from './manage-topic';
import { ListTopicsInType } from './list-topics-in-type';
import { TopicDetails } from './topic-details';
import { EditTopicType } from './edit-topic-type';
import { EditTopic } from './edit-topic';

export const topicRoutes = [
  {
    path: '/topics',
    element: <ManageTopicTypes />,
    children: [
      {
        path: '/topics',
        index: true,
        element: <ListTopicTypes />,
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
    path: '/topics/:topicType',
    element: <ManageTopicType />,
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
        index: true,
        element: <ListTopicItems />,
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
