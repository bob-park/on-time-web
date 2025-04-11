import api from '@/shared/api';

import delay from '@/utils/delay';

export async function getUsers(params: SearchPageParams) {
  return api.get('/api/users', { searchParams: { ...params, sort: 'username,asc' } }).json<Page<User>>();
}

export async function updateUserPassword(req: UpdateUserPasswordRequest) {
  const result = await api.post('/api/users/password', { json: req }).json<User>();

  await delay(1_000);

  return result;
}
