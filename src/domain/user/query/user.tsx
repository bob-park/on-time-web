import { currentUser } from '@/domain/user/api/session';
import { getUsers, resetUserAvatar, updateUserAvatar, updateUserPassword } from '@/domain/user/api/users';

import { InfiniteData, QueryKey, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

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

export function useUpdateUserPassword() {
  const { mutate, isPending } = useMutation({
    mutationKey: ['update', 'user', 'password'],
    mutationFn: (req: UpdateUserPasswordRequest) => updateUserPassword(req),
  });

  return { updatePassword: mutate, isLoading: isPending };
}

export function useUpdateUserAvatar(onSuccess?: () => void, onError?: () => void) {
  const { mutate, isPending } = useMutation({
    mutationKey: ['update', 'user', 'avatar'],
    mutationFn: (avatar: File) => updateUserAvatar(avatar),
    onSuccess: () => {
      onSuccess && onSuccess();
    },
    onError: () => {
      onError && onError();
    },
  });

  return { updateAvatar: mutate, isLoading: isPending };
}

export function useResetUserAvatar(onSuccess?: () => void, onError?: () => void) {
  const { mutate, isPending } = useMutation({
    mutationKey: ['reset', 'user', 'avatar'],
    mutationFn: () => resetUserAvatar(),
    onSuccess: () => {
      onSuccess && onSuccess();
    },
    onError: () => {
      onError && onError();
    },
  });

  return { resetAvatar: mutate, isLoading: isPending };
}
