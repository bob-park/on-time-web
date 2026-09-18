import { SendNotificationRequest } from '@/domain/notification/apis/notification.dto';
import { User } from '@/domain/users/apis/users.dto';
import api from '@/shared/api';

export async function sendMessage(userUniqueId: string, req: SendNotificationRequest) {
  return api.post(`/api/v1/users/${userUniqueId}/notification/send`, { json: req }).json<User>();
}
