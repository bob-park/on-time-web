import api from '@/shared/api';

export async function getUsers(params: SearchPageParams) {
  return api.get('/api/users', { searchParams: params }).json<Page<User>>();
}
