import api from '@/shared/api';

import delay from '@/utils/delay';

export async function record(req: RecordAttendanceRequest) {
  const result = await api.post('/api/attendance/record', { json: req }).json<AttendanceRecord>();

  await delay(1_000);

  return result;
}
