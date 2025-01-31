import api from '@/shared/api';

export async function logout() {
  await api.get('/api/logout');
}
