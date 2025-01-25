import { record } from '@/domain/attendance/api/attendanceRecord';
import { useMutation } from '@tanstack/react-query';

export function useRecordAttendance() {
  const { mutate, isPending } = useMutation({
    mutationKey: ['record', 'attendance'],
    mutationFn: (req: RecordAttendanceRequest) => record(req),
    onSuccess: () => {},
  });

  return { record: mutate, isLoading: isPending };
}
