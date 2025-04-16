import api from '@/shared/api';

export async function sendMessage(userUniqueId: string, req: SendNotificationRequest) {
  return api.post(`/api/users/${userUniqueId}/notification/send`, { json: req }).json<User>();
}
