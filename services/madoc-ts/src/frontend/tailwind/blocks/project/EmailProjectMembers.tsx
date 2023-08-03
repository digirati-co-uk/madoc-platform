import { useTranslation } from 'react-i18next';
import { ModalButton } from '../../../shared/components/Modal';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { useUser } from '../../../shared/hooks/use-site';
import { MailIcon } from '../../../shared/icons/MailIcon';
import { useRouteContext } from '../../../site/hooks/use-route-context';

export function EmailProjectMembers() {
  const { t } = useTranslation();
  const { projectId } = useRouteContext();
  const { data } = apiHooks.getProjectMemberEmails(() => (projectId ? [projectId] : undefined));
  const user = useUser();
  const isAdmin = user && user.scope && user.scope.indexOf('site.admin') !== -1;

  if (!isAdmin || !projectId) {
    return null;
  }

  const users = data?.users;
  return (
    <ModalButton
      title={t('Email project members')}
      render={() => {
        return (
          <>
            {!users?.length ? (
              <div>{t('No emails available')}</div>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-500">
                  {t('Only users who have made their emails accessible are listed')}
                </p>
                <textarea rows={10} className="border w-full p-3" value={users?.map(u => u.email).join('\n')} />
              </>
            )}
          </>
        );
      }}
    >
      <button className="text-sm flex gap-3 items-center m-3 hover:underline mx-auto text-sky-700">
        <MailIcon />
        {t('Email project members')}
      </button>
    </ModalButton>
  );
}
