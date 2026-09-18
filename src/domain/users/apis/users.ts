import {
  SearchUserLeaveEntryRequest,
  UpdateUserPasswordRequest,
  User,
  UserLeaveEntry,
  UserUsedVacation,
} from '@/domain/users/apis/users.dto';
import api from '@/shared/api';
import { PagedModel, SearchPageParams } from '@/shared/api/common.dto';
import delay from '@/utils/delay';

export async function getUsers(params: SearchPageParams) {
  // 삭제된 사용자는 제외하고 조회한다.
  return api
    .get('/api/v1/users', { searchParams: { ...params, isDeleted: false, sort: 'username,asc' } })
    .json<PagedModel<User>>();
}

export async function updateUserPassword(req: UpdateUserPasswordRequest) {
  const result = await api.post('/api/v1/users/password', { json: req }).json<User>();

  await delay(1_000);

  return result;
}

export async function updateUserAvatar(avatar: File) {
  const formData = new FormData();

  formData.append('avatar', avatar);

  const result = await api.post('/api/v1/users/avatar', { body: formData }).json<User>();

  await delay(1_000);

  return result;
}

export async function resetUserAvatar() {
  const result = await api.post('/api/v1/users/avatar/reset').json<User>();

  await delay(1_000);

  return result;
}

export async function updateUserSignature(signature: File) {
  const formData = new FormData();

  formData.append('signature', signature);

  const result = await api.post('/api/v1/users/signature', { body: formData }).json<User>();

  await delay(1_000);

  return result;
}

export async function getAllUserLeaveEntries(req: SearchUserLeaveEntryRequest) {
  return api.get('/api/v1/users/leave/entries', { searchParams: req }).json<User[]>();
}

export async function getUsersUsedVacations(req: SearchUserLeaveEntryRequest) {
  return api.get('/api/v1/users/used/vacations', { searchParams: req }).json<UserUsedVacation[]>();
}

export async function getUser(id: string) {
  return api.get(`/api/v1/users/${id}/summary`).json<User>();
}

export async function getUserLeaveEntry(id: string, year: number) {
  return api.get(`/api/v1/users/${id}/leave/entries`, { searchParams: { year } }).json<UserLeaveEntry>();
}
