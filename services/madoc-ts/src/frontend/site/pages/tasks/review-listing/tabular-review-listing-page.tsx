import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SubjectSnippet } from '../../../../../extensions/tasks/resolvers/subject-resolver';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { SimpleStatus } from '../../../../shared/atoms/SimpleStatus';
import { isEntity } from '../../../../shared/capture-models/helpers/is-entity';
import type { BaseField } from '../../../../shared/capture-models/types/field-types';
import { DisplayBreadcrumbs } from '../../../blocks/Breadcrumbs';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useApi } from '../../../../shared/hooks/use-api';
import { useInfiniteData } from '../../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { SimpleTable } from '../../../../shared/layout/SimpleTable';
import { HrefLink } from '../../../../shared/utility/href-link';
import { parseTabularCellFlags, TABULAR_CELL_FLAGS_PROPERTY } from '../../../../shared/utility/tabular-cell-flags';
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

function isBaseField(value: unknown): value is BaseField {
  return !!value && typeof value === 'object' && !isEntity(value) && 'value' in value;
}

function getFirstField(values: unknown[]): BaseField | null {
  const maybeField = values.find(isBaseField);
  return maybeField || null;
}

async function getTabularFlaggedCellCount(api: ReturnType<typeof useApi>, revisionId: string): Promise<number> {
  try {
    const revisionRequest = await api.crowdsourcing.getCaptureModelRevision(revisionId);
    const rawFlags = revisionRequest.document.properties[TABULAR_CELL_FLAGS_PROPERTY];

    if (!Array.isArray(rawFlags)) {
      return 0;
    }

    const flagsField = getFirstField(rawFlags);
    if (!flagsField) {
      return 0;
    }

    return Object.keys(parseTabularCellFlags(flagsField.value)).length;
  } catch {
    return 0;
  }
}

export function TabularReviewListingPage() {
  const { t } = useTranslation();
  const params = useParams<{ taskId?: string; slug?: string }>();
  const api = useApi();
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
  const isFlaggedSort = sort_by.startsWith('flagged_cells:');
  const flaggedSortDirection = sort_by.includes('flagged_cells:asc') ? 'asc' : 'desc';

  const taskRows = React.useMemo(
    () =>
      pages
        ? pages.flatMap(data =>
            (data.tasks || []).map((task: CrowdsourcingTask) => ({ task, page: data.pagination.page }))
          )
        : [],
    [pages]
  );

  const revisionIds = React.useMemo(
    () =>
      Array.from(
        new Set(
          taskRows
            .map(row => row.task.state.revisionId)
            .filter((value): value is string => typeof value === 'string' && value.length > 0)
        )
      ),
    [taskRows]
  );

  const [flaggedCountsByRevision, setFlaggedCountsByRevision] = React.useState<Record<string, number>>({});
  const missingRevisionIds = React.useMemo(
    () => revisionIds.filter(revisionId => typeof flaggedCountsByRevision[revisionId] !== 'number'),
    [flaggedCountsByRevision, revisionIds]
  );

  React.useEffect(() => {
    if (!missingRevisionIds.length) {
      return;
    }

    let isActive = true;

    void Promise.all(
      missingRevisionIds.map(
        async revisionId => [revisionId, await getTabularFlaggedCellCount(api, revisionId)] as const
      )
    ).then(entries => {
      if (!isActive) {
        return;
      }

      setFlaggedCountsByRevision(previous => {
        const next = { ...previous };
        for (const [revisionId, count] of entries) {
          next[revisionId] = count;
        }
        return next;
      });
    });

    return () => {
      isActive = false;
    };
  }, [api, missingRevisionIds]);

  const sortedTaskRows = React.useMemo(() => {
    if (!isFlaggedSort || missingRevisionIds.length) {
      return taskRows;
    }

    const defaultOrder = new Map(taskRows.map((row, index) => [row.task.id, index]));
    return [...taskRows].sort((left, right) => {
      const leftRevisionId = left.task.state.revisionId;
      const rightRevisionId = right.task.state.revisionId;
      const leftCount = leftRevisionId ? flaggedCountsByRevision[leftRevisionId] || 0 : 0;
      const rightCount = rightRevisionId ? flaggedCountsByRevision[rightRevisionId] || 0 : 0;

      if (leftCount !== rightCount) {
        return flaggedSortDirection === 'asc' ? leftCount - rightCount : rightCount - leftCount;
      }

      return (defaultOrder.get(left.task.id) || 0) - (defaultOrder.get(right.task.id) || 0);
    });
  }, [flaggedCountsByRevision, flaggedSortDirection, isFlaggedSort, missingRevisionIds.length, taskRows]);

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
                  <SimpleTable.Header style={{ width: '26%' }}>
                    <HrefLink
                      href={getSortLink('subject')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Manifest <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                  <SimpleTable.Header style={{ width: '22%' }}>
                    <HrefLink
                      href={getSortLink('subject_parent')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Canvas <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                  <SimpleTable.Header style={{ width: '14%' }}>
                    <HrefLink
                      href={getSortLink('modified_at')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Modified <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                  <SimpleTable.Header style={{ width: '10%' }}>
                    <HrefLink
                      href={getSortLink('flagged_cells')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Flagged <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                  <SimpleTable.Header style={{ width: '13%' }}>
                    <HrefLink
                      href={getSortLink('status')}
                      style={{ color: '#111', display: 'inline-flex', gap: '0.4em' }}
                    >
                      Status <Chevron />
                    </HrefLink>
                  </SimpleTable.Header>
                  <SimpleTable.Header style={{ width: '15%' }}>
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
                {sortedTaskRows.map(({ task, page }, index: number) => (
                  <TabularReviewTableRow
                    key={task.id}
                    index={index}
                    task={task}
                    page={page}
                    active={task.id === params.taskId}
                    hideManifests={hideManifests}
                    flaggedCellCount={task.state.revisionId ? flaggedCountsByRevision[task.state.revisionId] : 0}
                  />
                ))}
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
  flaggedCellCount,
}: {
  task: CrowdsourcingTask;
  active?: boolean;
  page?: number;
  index: number;
  hideManifests?: boolean;
  flaggedCellCount?: number;
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
      <SimpleTable.Cell style={{ width: '26%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {metadata.subject && metadata.subject.type === 'manifest' ? (
          <LocaleString>{metadata.subject.label}</LocaleString>
        ) : metadata.subject?.parent ? (
          <LocaleString>{metadata.subject.parent.label}</LocaleString>
        ) : null}
      </SimpleTable.Cell>
      <SimpleTable.Cell style={{ width: '22%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {metadata.subject && metadata.subject.type !== 'manifest' && metadata.subject.label ? (
          <LocaleString>{metadata.subject.label}</LocaleString>
        ) : null}
      </SimpleTable.Cell>
      <SimpleTable.Cell style={{ width: '14%' }}>
        {task.modified_at ? <>{new Date(task.modified_at).toLocaleDateString()}</> : null}
      </SimpleTable.Cell>
      <SimpleTable.Cell style={{ width: '10%' }}>
        {typeof flaggedCellCount === 'number' ? flaggedCellCount : task.state.revisionId ? '...' : 0}
      </SimpleTable.Cell>
      <SimpleTable.Cell style={{ width: '13%' }}>
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
        style={{ width: '15%' }}
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
