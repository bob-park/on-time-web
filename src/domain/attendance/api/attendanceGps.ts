import index from '@/shared/api';

export async function getAll() {
  return index.get('/api/attendance/gps').json<AttendanceGps[]>();
}
