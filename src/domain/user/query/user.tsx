import { InfiniteData, QueryKey, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { currentUser } from '@/domain/user/api/session';
import {
  getAllUserLeaveEntries,
  getUsers,
  getUsersUsedVacations,
  resetUserAvatar,
  updateUserAvatar,
  updateUserPassword,
  updateUserSignature,
} from '@/domain/user/api/users';
import { getNextPageParams } from '@/shared/api';
import { PagedModel } from '@/shared/api/common.dto';

export function useGetCurrentUser() {
  const { data, isLoading } = useQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: () => currentUser(),
  });

  return { currentUser: data, isLoading };
}

export function useGetUsers(params: SearchPageParams) {
  const { data, fetchNextPage, isLoading, isError, refetch } = useInfiniteQuery<
    PagedModel<User>,
    unknown,
    InfiniteData<PagedModel<User>>,
    QueryKey,
    SearchPageParams
  >({
    queryKey: ['users', params],
    queryFn: async ({ pageParam }) => getUsers(pageParam),
    initialPageParam: {
      size: 100,
      page: 0,
    },
    getNextPageParam: (lastPage) => getNextPageParams<User>(lastPage),
    staleTime: 60 * 1_000,
    gcTime: 5 * 60 * 1_000,
  });

  return {
    pages: data?.pages || ([] as PagedModel<User>[]),
    isLoading,
    isError,
    fetchNextPage,
    reload: refetch,
  };
}

export function useUpdateUserPassword(onSuccess?: () => void, onError?: () => void) {
  const { mutate, isPending } = useMutation({
    mutationKey: ['update', 'user', 'password'],
    mutationFn: (req: UpdateUserPasswordRequest) => updateUserPassword(req),
    onSuccess: () => {
      onSuccess && onSuccess();
    },
    onError: () => {
      onError && onError();
    },
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

export function useUpdateUserSignature(onSuccess?: () => void, onError?: () => void) {
  const { mutate, isPending } = useMutation({
    mutationKey: ['update', 'user', 'signature'],
    mutationFn: (signature: File) => updateUserSignature(signature),
    onSuccess: () => {
      onSuccess && onSuccess();
    },
    onError: () => {
      onError && onError();
    },
  });

  return { updateSignature: mutate, isLoading: isPending };
}

export function useUserLeaveEntries(req: SearchUserLeaveEntryRequest) {
  const { data, isLoading } = useQuery<User[]>({
    queryKey: ['users', 'leave', 'entries', req],
    queryFn: () => getAllUserLeaveEntries(req),
  });

  return { users: data || ([] as User[]), isLoading };
}

export function useUsersUsedVacations(req: SearchUserLeaveEntryRequest) {
  const { data, isLoading } = useQuery<UserUsedVacation[]>({
    queryKey: ['users', 'used', 'vacations', req],
    queryFn: () => getUsersUsedVacations(req),
  });

  return { usersUsedVacations: data || ([] as UserUsedVacation[]), isLoading };
}
