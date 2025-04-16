import { sendMessage } from '@/domain/user/api/userNotification';

import { useMutation } from '@tanstack/react-query';

export function useUserNotification(onSuccess?: () => void, onError?: () => void) {
  const { mutate, isPending } = useMutation({
    mutationKey: ['send', 'user', 'notification'],
    mutationFn: ({ userUniqueId, body }: { userUniqueId: string; body: SendNotificationRequest }) =>
      sendMessage(userUniqueId, body),
    onSuccess: () => {
      onSuccess && onSuccess();
    },
    onError: () => {
      onError && onError();
    },
  });

  return { sendMessage: mutate, isLoading: isPending };
}
