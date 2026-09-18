import api from '@/shared/api';

export async function getUserCompLeaveEntries() {
  return api.get(`/api/v1/users/comp/leave/entries`).json<UserCompLeaveEntry[]>();
}
