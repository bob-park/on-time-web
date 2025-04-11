import { currentUser } from '@/domain/user/api/session';
import { getUsers } from '@/domain/user/api/users';

import { InfiniteData, QueryKey, useInfiniteQuery, useQuery } from '@tanstack/react-query';

export function useGetCurrentUser() {
  const { data, isLoading } = useQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: () => currentUser(),
  });

  return { currentUser: data, isLoading };
}

export function useGetUsers(params: SearchPageParams) {
  const { data, fetchNextPage, isLoading, refetch } = useInfiniteQuery<
    Page<User>,
    unknown,
    InfiniteData<Page<User>>,
    QueryKey,
    SearchPageParams
  >({
    queryKey: ['users', params],
    queryFn: async ({ pageParam }) => getUsers(pageParam),
    initialPageParam: {
      size: 100,
      page: 0,
    },
    getNextPageParam: (lastPage, allPages) => {
      let totalPage = Math.ceil(lastPage.total / lastPage.pageable.pageSize);

      if (lastPage.total % lastPage.pageable.pageSize > 0) {
        totalPage = totalPage + 1;
      }

      const page = {
        size: lastPage.pageable.pageSize,
        page: lastPage.pageable.pageNumber,
      };
      const nextPage = page.page + 1;

      return {
        size: page.size,
        page: page.page + 1 > totalPage ? totalPage : nextPage,
      };
    },
    staleTime: 60 * 1_000,
    gcTime: 5 * 60 * 1_000,
  });

  return {
    pages: data?.pages || ([] as Page<User>[]),
    isLoading,
    fetchNextPage,
    reload: refetch,
  };
}
