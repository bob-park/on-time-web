import { currentUser, logout } from '@/domain/user/api/session';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useLogout(onSuccess: () => void) {
  const { mutate } = useMutation({
    mutationKey: ['user', 'logout'],
    mutationFn: () => logout(),
    onSuccess: () => {
      onSuccess && onSuccess();
    },
  });

  return { logout: mutate };
}

export function useSession() {
  const { data } = useQuery<User>({
    queryKey: ['user', 'session'],
    queryFn: () => currentUser(),
    refetchInterval: 60 * 1_000,
    staleTime: 5 * 60 * 1_000,
    gcTime: 10 * 60 * 1_000,
  });

  return { user: data };
}
