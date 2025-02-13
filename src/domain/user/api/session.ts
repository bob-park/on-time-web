import index from '@/shared/api';

export async function logout() {
  await index.get('/api/logout');
}

export async function currentUser() {
  return index.get('/api/users/me').json<User>();
}
