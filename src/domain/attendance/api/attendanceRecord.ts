import api from '@/shared/api';

import delay from '@/utils/delay';

export async function record(req: RecordAttendanceRequest) {
  const result = await api.post('/api/attendance/records', { json: req }).json<AttendanceRecord>();

  await delay(1_000);

  return result;
}
export async function getAllRecords(req: GetAttendanceRecordRequest) {
  const result = await api.get('/api/attendance/records', { searchParams: req }).json<AttendanceRecord[]>();

  await delay(1_000);

  return result;
}
