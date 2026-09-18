import {
  AddAttendanceScheduleRequest,
  AttendanceRecord,
  GetAttendanceRecordRequest,
  RecordAttendanceRequest,
} from '@/domain/attendance/apis/attendance.dto';
import index from '@/shared/api';
import delay from '@/utils/delay';

export async function record(req: RecordAttendanceRequest) {
  const result = await index.post('/api/v1/attendance/records', { json: req }).json<AttendanceRecord>();

  await delay(1_000);

  return result;
}
export async function getAllRecords(req: GetAttendanceRecordRequest) {
  return index.get('/api/v1/attendance/records', { searchParams: req }).json<AttendanceRecord[]>();
}

export async function addSchedule(req: AddAttendanceScheduleRequest) {
  const result = await index.post('/api/v1/attendance/schedules', { json: req }).json<AttendanceRecord>();

  await delay(1_000);

  return result;
}
