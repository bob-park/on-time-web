import { useMutation } from '@tanstack/react-query';

import { SendNotificationRequest } from '@/domain/notification/apis/notification.dto';
import { sendMessage } from '@/domain/users/apis/userNotification';

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
