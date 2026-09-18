import index from '@/shared/api';

export async function logout() {
  await index.get('/api/v1/logout');
}

export async function currentUser() {
  return index.get('/api/v1/users/me').json<User>();
}
