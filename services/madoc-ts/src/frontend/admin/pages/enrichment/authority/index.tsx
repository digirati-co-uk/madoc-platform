import React from 'react';
import { Link } from 'react-router-dom';
import { Authority } from './authority';
import { EntityType } from './entity-type/entity-type';
import { ListEntityTypes } from './entity-type/list-entity-types';
import { NewEntityType } from './entity-type/new-entity-type';
import { Entity } from './entity/entity';
import { ListEntities } from './entity/list-entities';
import { NewEntity } from './entity/new-entity';
import { ListResourceTags } from './list-resource-tags';

export const authorityRoutes = [
  {
    path: '/enrichment/authority',
    element: <Authority />,
    children: [
      {
        path: '/enrichment/authority',
        index: true,
        element: <AuthorityIndex />,
      },
      {
        path: '/enrichment/authority/entities',
        element: <ListEntities />,
      },
      {
        path: '/enrichment/authority/entities/new',
        element: <NewEntity />,
      },
      {
        path: '/enrichment/authority/entities/:id',
        element: <Entity />,
      },
      {
        path: '/enrichment/authority/entity-types',
        element: <ListEntityTypes />,
      },
      {
        path: '/enrichment/authority/entity-types/new',
        element: <NewEntityType />,
      },
      {
        path: '/enrichment/authority/entity-types/:id',
        element: <EntityType />,
      },
      {
        path: '/enrichment/authority/resource-tags',
        element: <ListResourceTags />,
      },
    ],
  },
];

export function AuthorityIndex() {
  return (
    <div>
      <ul>
        <li>
          <Link to={'entities'}>Entities</Link>
        </li>
        <li>
          <Link to={'entity-types'}>Entity types</Link>
        </li>
        <li>
          <Link to={'resource-tags'}>Resource tags</Link>
        </li>
      </ul>
    </div>
  );
}
