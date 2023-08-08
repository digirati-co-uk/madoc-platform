import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { useSite, useUser } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRouteContext } from '../../../site/hooks/use-route-context';
import { EmailProjectMembers } from './EmailProjectMembers';

export function ProjectMembersList() {
  const site = useSite();
  const { t } = useTranslation();
  const { projectId } = useRouteContext();
  const { data } = apiHooks.getAllSiteProjectMembers(() => (projectId ? [projectId] : undefined));
  const user = useUser();
  const isAdmin = user && user.scope && user.scope.indexOf('site.admin') !== -1;

  if (!data?.members.length || !projectId) {
    return null;
  }

  const members = data?.members || [];

  return (
    <div className="my-5 max-w-5xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">{t('Contributors')}</h3>
      {isAdmin ? <EmailProjectMembers /> : null}
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {members.map(member => (
          <HrefLink
            key={member.id}
            href={`/users/${member.user.id}`}
            className="no-underline hover:outline outline-slate-400 focus:outline rounded outline-2"
          >
            <div key={member.id} className="w-80 bg-slate-100 rounded flex h-12 items-center gap-4 p-4">
              <div>
                <img
                  src={`/s/${site.slug}/madoc/api/users/${member.user.id}/image`}
                  className="w-8 h-8 rounded-full"
                  alt=""
                />
              </div>
              <div className="text-sm">
                <div className="font-bold text-slate-800">{member.user.name}</div>
                {member.role ? <div className="text-slate-500">{member.role.label}</div> : null}
              </div>
            </div>
          </HrefLink>
        ))}
      </div>
    </div>
  );
}

blockEditorFor(ProjectMembersList, {
  type: 'default.ProjectMembersList',
  label: 'Project members list',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
