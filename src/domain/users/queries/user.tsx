import { InfiniteData, QueryKey, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { searchApprovalHistories } from '@/domain/approval/apis/approvalHistory';
import {
  getAllUserLeaveEntries,
  getUser,
  getUserLeaveEntry,
  getUsers,
  getUsersUsedVacations,
  resetUserAvatar,
  updateUserAvatar,
  updateUserPassword,
  updateUserSignature,
} from '@/domain/users/apis/users';
import {
  SearchUserLeaveEntryRequest,
  UpdateUserPasswordRequest,
  User,
  UserLeaveEntry,
  UserUsedVacation,
} from '@/domain/users/apis/users.dto';
import { getNextPageParams } from '@/shared/api';
import { PagedModel, SearchPageParams } from '@/shared/api/common.dto';
import { authClient } from '@/shared/auth/auth-client';

export function useUser() {
  const { data: session } = authClient.useSession();
  const sub = session?.user.sub;

  const { data, isLoading } = useQuery<User>({
    queryKey: ['users', sub, 'summary'],
    queryFn: () => getUser(sub!),
    enabled: !!sub,
  });

  return { user: data, isLoading: isLoading || !sub };
}

export function useUserLeaveEntry(year: number) {
  const { data: session } = authClient.useSession();
  const sub = session?.user.sub;

  const { data, isLoading } = useQuery<UserLeaveEntry>({
    queryKey: ['users', sub, 'leave', 'entries', year],
    queryFn: () => getUserLeaveEntry(sub!, year),
    enabled: !!sub,
  });

  return { leaveEntry: data, isLoading };
}

export function useProceedingApprovalCount() {
  const { data: session } = authClient.useSession();
  const sub = session?.user.sub;

  const { data } = useQuery({
    queryKey: ['documents', 'approval', 'proceeding', sub],
    queryFn: () => searchApprovalHistories({ userUniqueId: sub, status: 'WAITING', page: 0, size: 1 }),
    enabled: !!sub,
  });

  return { count: data?.page.totalElements ?? 0 };
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
