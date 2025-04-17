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

export async function updateUserAvatar(avatar: File) {
  const formData = new FormData();

  formData.append('avatar', avatar);

  const result = await api.post('/api/users/avatar', { body: formData }).json<User>();

  await delay(1_000);

  return result;
}

export async function resetUserAvatar() {
  const result = await api.post('/api/users/avatar/reset').json<User>();

  await delay(1_000);

  return result;
}

export async function updateUserSignature(signature: File) {
  const formData = new FormData();

  formData.append('signature', signature);

  const result = await api.post('/api/users/signature', { body: formData }).json<User>();

  await delay(1_000);

  return result;
}

export async function getAllUserLeaveEntries(req: SearchUserLeaveEntryRequest) {
  return api.get('/api/users/leave/entries', { searchParams: req }).json<User[]>();
}
