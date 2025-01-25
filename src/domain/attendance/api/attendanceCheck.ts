import api from '@/shared/api';

import delay from '@/utils/delay';

export async function currentCheck(req: CurrentAttendanceCheckRequest) {
  const result = await api.post('/api/attendance/check/current', { json: req }).json<AttendanceCheck>();

  await delay(1_000);

  return result;
}
