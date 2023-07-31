import React from 'react';
import { useTranslation } from 'react-i18next';
import { StaticMarkdownBlock } from '../../../extensions/page-blocks/simple-markdown-block/static-markdown-block';
import { ProjectUpdate } from '../../../types/projects';
import { TimeAgo } from '../../shared/atoms/TimeAgo';
import { HrefLink } from '../../shared/utility/href-link';

export function ViewProjectUpdate(props: ProjectUpdate) {
  const { t } = useTranslation();
  return (
    <div className="container my-4 border border-gray-300 overflow-hidden bg-white">
      <div className="m-6">
        <StaticMarkdownBlock markdown={props.update} />
      </div>
      <div className="flex items-end p-4 bg-slate-50 border-t-2 ">
        {props.user ? (
          <div className="text-sm">
            {t('Posted by')} <HrefLink href={`/users/${props.user.id}`}>{props.user.name}</HrefLink>
          </div>
        ) : null}
        <div className="ml-auto text-gray-500 text-sm">
          <TimeAgo date={props.created} />
        </div>
      </div>
    </div>
  );
}
