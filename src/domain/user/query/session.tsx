import { logout } from '@/domain/user/api/session';
import { useMutation } from '@tanstack/react-query';

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
