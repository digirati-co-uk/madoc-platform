import React from 'react';
import { useTranslation } from 'react-i18next';
import { NoteListResponse } from '../../../types/personal-notes';
import { EmptyState } from '../../shared/layout/EmptyState';
import { GridContainer } from '../../shared/layout/Grid';
import { Heading1, Subheading1 } from '../../shared/typography/Heading1';
import { CroppedImage } from '../../shared/atoms/Images';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { SnippetThumbnail, SnippetThumbnailContainer } from '../../shared/atoms/SnippetLarge';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Pagination } from '../../shared/components/Pagination';
import { ResultTitle } from '../../shared/components/SearchResults';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { serverRendererFor } from '../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../shared/utility/href-link';
import { useProject } from '../hooks/use-project';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const ViewProjectNotes: React.FC = () => {
  const { t } = useTranslation();
  const { data: project } = useProject();
  const createLink = useRelativeLinks();
  const { data } = usePaginatedData<NoteListResponse>(ViewProjectNotes, undefined, {
    staleTime: 500,
  });
  const size = 'small';

  const pagination = data?.pagination;

  if (!project) {
    return null;
  }

  return (
    <>
      <DisplayBreadcrumbs currentPage={t('Personal notes')} />

      <LocaleString as={Heading1}>{project.label}</LocaleString>
      <LocaleString as={Subheading1}>{t('Personal notes that you have made in this project')}</LocaleString>

      <Pagination
        page={pagination ? pagination.page : 1}
        totalPages={pagination ? pagination.totalPages : 1}
        stale={!pagination}
      />

      <div>
        {data
          ? data.notes.map(note => {
              const isManifest = note.type === 'manifest';
              return (
                <GridContainer key={note.id}>
                  {note.resource.thumbnail ? (
                    <ImageStripBox $size={size}>
                      {isManifest ? (
                        <SnippetThumbnailContainer
                          data-is-stacked={isManifest}
                          data-is-portrait={true}
                          data-is-fluid={true}
                        >
                          <SnippetThumbnail src={note.resource.thumbnail} />
                        </SnippetThumbnailContainer>
                      ) : (
                        <CroppedImage $size={size}>
                          <img src={note.resource.thumbnail} />
                        </CroppedImage>
                      )}
                    </ImageStripBox>
                  ) : null}
                  <div style={{ alignSelf: 'flex-start', marginLeft: '1em', marginBottom: '1em' }}>
                    {note.parentResource ? (
                      <ResultTitle
                        as={HrefLink}
                        href={createLink({ canvasId: note.resource.id, manifestId: note.parentResource.id })}
                      >
                        <LocaleString>{note.parentResource.label}</LocaleString>
                        {' - '}
                        <LocaleString>{note.resource.label}</LocaleString>
                      </ResultTitle>
                    ) : (
                      <LocaleString as={ResultTitle}>{note.resource.label}</LocaleString>
                    )}

                    <div style={{ paddingBottom: '.8em', whiteSpace: 'pre' }}>{note.note}</div>
                  </div>
                </GridContainer>
              );
            })
          : null}
        {data && data.notes.length === 0 ? (
          <EmptyState $box>{t('Personal notes you make on images will appear here')}</EmptyState>
        ) : null}
      </div>

      <Pagination
        page={pagination ? pagination.page : 1}
        totalPages={pagination ? pagination.totalPages : 1}
        stale={!pagination}
      />
    </>
  );
};

serverRendererFor(ViewProjectNotes, {
  getKey(params, query) {
    return ['project-notes', { projectId: params.slug, page: query.page ? Number(query.page) : 1 }];
  },
  async getData(key, vars, api) {
    return api.getAllPersonalNotes(vars.projectId, vars.page);
  },
});
