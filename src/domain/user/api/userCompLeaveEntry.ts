import api from '@/shared/api';

export async function getUserCompLeaveEntries() {
  return api.get(`/api/users/comp/leave/entries`).json<UserCompLeaveEntry[]>();
}
