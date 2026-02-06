import { useLayoutEffect, useRef } from 'react';
import { useBrowserLayoutEffect } from '../../shared/hooks/use-browser-layout-effect';

export function useInfiniteAction({
  canFetchMore,
  fetchMore,
  isFetchingMore,
  container,
}: {
  canFetchMore?: boolean;
  fetchMore: () => any;
  isFetchingMore?: false | 'next' | 'previous';
  container?: any;
}) {
  const loadMoreButton = useRef<any>(undefined);

  useBrowserLayoutEffect(() => {
    if (loadMoreButton.current) {
      const observer = new IntersectionObserver(
        entries => {
          const target = entries[0];
          if (target.isIntersecting && canFetchMore && !isFetchingMore) {
            fetchMore();
          }
        },
        {
          root: container ? container.current : null,
          threshold: 0.5,
        }
      );

      observer.observe(loadMoreButton.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [canFetchMore, container, fetchMore, isFetchingMore]);

  return [loadMoreButton];
}
