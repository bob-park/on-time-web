import index from '@/shared/api';

export async function getAll() {
  return index.get('/api/v1/attendance/gps').json<AttendanceGps[]>();
}
