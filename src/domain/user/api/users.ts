import api from '@/shared/api';
import { Page, SearchPageParams } from '@/shared/types';

export async function getUsers(params: SearchPageParams) {
  return api.get('/api/users', { searchParams: params }).json<Page<User>>;
}
