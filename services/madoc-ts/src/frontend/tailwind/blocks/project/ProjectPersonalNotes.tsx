import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResultTitle } from '../../../shared/components/SearchResults';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { LocaleString, useRouteContext } from '../../../shared/plugins/public-api';
import { HrefLink } from '../../../shared/utility/href-link';
import { useProject } from '../../../site/hooks/use-project';
import { useRelativeLinks } from '../../../site/hooks/use-relative-links';

export function ProjectPersonalNotes() {
  const { t } = useTranslation();
  const { projectId } = useRouteContext();
  const { data: project } = useProject();
  const createLink = useRelativeLinks();
  const { data } = apiHooks.getAllPersonalNotes(() => (projectId ? [projectId] : undefined));

  const toDisplay = 3;

  if (!project || !data || !data.notes) {
    return null;
  }

  return (
    <div className="my-5 max-w-3xl">
      <h3 className="text-xl font-semibold mb-4">{t('Personal notes')}</h3>
      <div className="">
        {data.notes.map((note, index) => {
          const link = note.parentResource
            ? createLink({ canvasId: note.resource.id, manifestId: note.parentResource.id })
            : createLink({ manifestId: note.resource.id });

          if (index + 1 > toDisplay) {
            return null;
          }
          return (
            <HrefLink href={link} key={note.id} className="no-underline">
              <div className="gap-4 relative overflow-hidden my-5 pb-5 border-b">
                <div className="relative z-5 flex gap-5">
                  {note.resource.thumbnail ? (
                    <div className="aspect-square w-40 overflow-hidden flex items-center bg-slate-100 self-start">
                      <img src={note.resource.thumbnail} alt="" className="object-cover w-max h-max" />
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg text-sky-600">
                      {note.parentResource ? (
                        <>
                          <LocaleString>{note.parentResource.label}</LocaleString>
                          {' - '}
                          <LocaleString>{note.resource.label}</LocaleString>
                        </>
                      ) : (
                        <LocaleString as={ResultTitle}>{note.resource.label}</LocaleString>
                      )}
                    </h4>

                    <div className="whitespace-pre-wrap">{note.note}</div>
                  </div>
                </div>
              </div>
            </HrefLink>
          );
        })}
        {data.notes.length > toDisplay ? (
          <HrefLink href={createLink({ projectId: project.id, subRoute: 'personal-notes' })}>
            <div className="text-sm underline px-2 flex items-center gap-2">
              <span>{t('View all {{count}} notes', { count: data.notes.length })}</span>
              <span className="text-sky-600">
                <svg
                  className="w-4 h-4"
                  style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M16.59,11H4a1,1,0,0,0,0,2H16.59l-3.3,3.29a1,1,0,1,0,1.42,1.42l5-5a1,1,0,0,0,0-1.42l-5-5a1,1,0,0,0-1.42,1.42Z"
                  />
                </svg>
              </span>
            </div>
          </HrefLink>
        ) : null}
      </div>
    </div>
  );
}
