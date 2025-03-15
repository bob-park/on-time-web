import index from '@/shared/api';

export async function getUsers(params: SearchPageParams) {
  return index.get('/api/users', { searchParams: params }).json<Page<User>>();
}
