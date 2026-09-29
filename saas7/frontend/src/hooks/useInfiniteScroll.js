import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (fetchMore, hasMore) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const onScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
    if (isFetching || !hasMore) return;
    setIsFetching(true);
  }, [isFetching, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  useEffect(() => {
    if (!isFetching) return;
    const load = async () => {
      setIsLoading(true);
      await fetchMore();
      setIsFetching(false);
      setIsLoading(false);
    };
    load();
  }, [isFetching, fetchMore]);

  return { isLoading, isFetching };
};
