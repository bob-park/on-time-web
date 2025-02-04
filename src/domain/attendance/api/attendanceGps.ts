import api from '@/shared/api';

export async function getAll() {
  return api.get('/api/attendance/gps').json<AttendanceGps[]>();
}
