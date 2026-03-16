import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SubjectSnippet } from '../../../../../extensions/tasks/resolvers/subject-resolver';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { SimpleStatus } from '../../../../shared/atoms/SimpleStatus';
import { DisplayBreadcrumbs } from '../../../blocks/Breadcrumbs';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useInfiniteData } from '../../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { SimpleTable } from '../../../../shared/layout/SimpleTable';
import { HrefLink } from '../../../../shared/utility/href-link';
import { useRelativeLinks } from '../../../hooks/use-relative-links';
import { useTaskMetadata } from '../../../hooks/use-task-metadata';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { Chevron } from '../../../../shared/icons/Chevron';
import { useInfiniteAction } from '../../../hooks/use-infinite-action';
import { RefetchProvider } from '../../../../shared/utility/refetch-context';
import { useKeyboardListNavigation } from '../../../hooks/use-keyboard-list-navigation';
import { useLocalStorage } from '../../../../shared/hooks/use-local-storage';
import { ItemFilter } from '../../../../shared/components/ItemFilter';
import { ReviewListingPage } from './review-listing-page';

const REVIEW_STATUS_MAP: Record<string, number> = {
  todo: 1,
  in_review: 2,
  approved: 3,
  changes_requested: 4,
};

export function TabularReviewListingPage() {
  const { t } = useTranslation();
  const params = useParams<{ taskId?: string; slug?: string }>();
  const projectId = params.slug;
  const createLink = useRelativeLinks();
  const navigate = useNavigate();
  const { sort_by = '', status, assignee } = useLocationQuery();
  const [hideManifests, setHideManifests] = useLocalStorage('hide-manifest-reviews', false);

  const {
    data: pages,
    fetchMore,
    refetch,
    canFetchMore,
    isFetchingMore,
  } = useInfiniteData(ReviewListingPage, undefined, {
    refetchOnMount: true,
    forceFetchOnMount: true,
    getFetchMore: lastPage => {
      if (lastPage.pagination.totalPages === 0 || lastPage.pagination.totalPages === lastPage.pagination.page) {
        return undefined;
      }
      return {
        page: lastPage.pagination.page + 1,
      };
    },
  });

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [loadMoreButton] = useInfiniteAction({
    fetchMore,
    canFetchMore,
    isFetchingMore,
    container: containerRef,
  });
  const containerProps = useKeyboardListNavigation('data-review-task-row');

  const getSortLink = (field: string) => {
    const current = sort_by;
    let nextSort = `${field}:desc`;
    if (current && current.includes(`${field}:desc`)) {
      nextSort = `${field}:asc`;
    }
    if (current && current.includes(`${field}:asc`)) {
      nextSort = '';
    }

    return createLink({
      taskId: undefined,
      subRoute: 'reviews',
      query: {
        sort_by: nextSort || undefined,
        status,
        assignee,
        page: undefined,
      },
    });
  };

  const selectedStatusKey =
    status && Object.entries(REVIEW_STATUS_MAP).find(([, value]) => String(value) === String(status))?.[0];

  return (
    <RefetchProvider refetch={refetch}>
      <DisplayBreadcrumbs currentPage={t('Reviews')} />

      <div style={{ paddingBottom: '0.5em' }}>
        <ButtonRow>
          <Button as={Link} to={createLink({ projectId, subRoute: 'tasks', query: { type: 'crowdsourcing-review' } })}>
            {t('Task view')}
          </Button>

          <Button onClick={() => setHideManifests(!hideManifests)}>
            {hideManifests ? t('Hide manifests') : t('Show manifests')}
          </Button>

          {(status || assignee) && (
            <Button as={Link} to={createLink({ projectId, subRoute: 'reviews', query: {} })}>
              {t('Reset filters')}
            </Button>
          )}

          <ItemFilter
            label={
              status
                ? t(
                    Object.entries(REVIEW_STATUS_MAP).find(([, value]) => String(value) === String(status))?.[0] ??
                      'Filter by status'
                  )
                : t('Filter by status')
            }
            closeOnChange
            items={[
              { key: 'todo', label: t('To do') },
              { key: 'in_review', label: t('In review') },
              { key: 'approved', label: t('Approved') },
              { key: 'changes_requested', label: t('Changes requested') },
            ].map(option => ({
              id: option.key,
              label: option.label,
              onChange: selected => {
                navigate(
                  createLink({
                    projectId,
                    subRoute: 'reviews',
                    taskId: undefined,
                    query: {
                      status: selected ? REVIEW_STATUS_MAP[option.key] : undefined,
                      assignee,
                      page: undefined,
                    },
                  })
                );
              },
            }))}
            selected={selectedStatusKey ? [selectedStatusKey] : []}
          />
        </ButtonRow>
      </div>

      <div ref={containerRef} className="h-[80vh] overflow-auto rounded border border-gray-300 bg-white">
        {!pages ? (
          <div className="p-4 text-sm text-gray-600">Loading...</div>
        ) : (
          <>
            <SimpleTable.Table style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <SimpleTable.Row style={{ height: 47 }}>
                  <SimpleTable.Header style={{ width: '30%' }}>
                    <HrefLink
                      href={getSortLink('subject')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Manifest <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                  <SimpleTable.Header style={{ width: '24%' }}>
                    <HrefLink
                      href={getSortLink('subject_parent')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Canvas <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                  <SimpleTable.Header style={{ width: '16%' }}>
                    <HrefLink
                      href={getSortLink('modified_at')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Modified <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                  <SimpleTable.Header style={{ width: '14%' }}>
                    <HrefLink
                      href={getSortLink('status')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Status <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                  <SimpleTable.Header style={{ width: '16%' }}>
                    <HrefLink
                      href={getSortLink('assignee_id')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Assignee <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                </SimpleTable.Row>
              </thead>
              <tbody {...(containerProps as any)}>
                {pages.map(data =>
                  (data.tasks || []).map((task: CrowdsourcingTask, index: number) => (
                    <TabularReviewTableRow
                      key={task.id}
                      index={index}
                      task={task}
                      page={data.pagination.page}
                      active={task.id === params.taskId}
                      hideManifests={hideManifests}
                    />
                  ))
                )}
              </tbody>
            </SimpleTable.Table>
            <Button
              ref={loadMoreButton}
              onClick={() => fetchMore()}
              style={{ display: canFetchMore ? 'block' : 'none', margin: '1em' }}
            >
              Load more
            </Button>
          </>
        )}
      </div>
    </RefetchProvider>
  );
}

function TabularReviewTableRow({
  task,
  active,
  page,
  index,
  hideManifests,
}: {
  task: CrowdsourcingTask;
  active?: boolean;
  page?: number;
  index: number;
  hideManifests?: boolean;
}) {
  const query = useLocationQuery();
  const createLink = useRelativeLinks({ subRoute: 'reviews' });
  const navigate = useNavigate();
  const metadata = useTaskMetadata<{ subject?: SubjectSnippet }>(task);

  if (metadata.subject?.type === 'manifest' && hideManifests) {
    return null;
  }

  return (
    <SimpleTable.Row
      tabIndex={index === 0 ? 0 : -1}
      data-review-task-row={index}
      style={{ background: active ? '#edf4fb' : undefined, cursor: 'pointer' }}
      onClick={event => {
        if ((event.target as HTMLElement)?.tagName === 'A') {
          return;
        }
        navigate(
          createLink({
            subRoute: 'reviews',
            taskId: task.id,
            query,
            hash: page ? String(page) : '1',
          })
        );
      }}
    >
      <SimpleTable.Cell style={{ width: '30%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {metadata.subject && metadata.subject.type === 'manifest' ? (
          <LocaleString>{metadata.subject.label}</LocaleString>
        ) : metadata.subject?.parent ? (
          <LocaleString>{metadata.subject.parent.label}</LocaleString>
        ) : null}
      </SimpleTable.Cell>
      <SimpleTable.Cell style={{ width: '24%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {metadata.subject && metadata.subject.type !== 'manifest' && metadata.subject.label ? (
          <LocaleString>{metadata.subject.label}</LocaleString>
        ) : null}
      </SimpleTable.Cell>
      <SimpleTable.Cell style={{ width: '16%' }}>
        {task.modified_at ? <>{new Date(task.modified_at).toLocaleDateString()}</> : null}
      </SimpleTable.Cell>
      <SimpleTable.Cell style={{ width: '14%' }}>
        <SimpleStatus
          onClick={event => {
            event.stopPropagation();
            navigate(createLink({ subRoute: 'reviews', taskId: task.id, query: { status: task.status } }));
          }}
          status={task.status}
          status_text={task.status_text || ''}
        />
      </SimpleTable.Cell>
      <SimpleTable.Cell
        style={{ width: '16%' }}
        onClick={event => {
          if (!task.assignee) {
            return;
          }
          event.stopPropagation();
          navigate(createLink({ subRoute: 'reviews', taskId: task.id, query: { assignee: task.assignee.id } }));
        }}
        className="hover:underline"
      >
        {task.assignee ? task.assignee.name : ''}
      </SimpleTable.Cell>
    </SimpleTable.Row>
  );
}
