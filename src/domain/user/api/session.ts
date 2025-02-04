import api from '@/shared/api';

export async function logout() {
  await api.get('/api/logout');
}

export async function currentUser() {
  return api.get('/api/user/me').json<User>();
}
