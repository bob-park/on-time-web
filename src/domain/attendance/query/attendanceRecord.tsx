import { getAllRecords, record } from '@/domain/attendance/api/attendanceRecord';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGetResultAttendanceRecord({ checkId }: { checkId: string }) {
  const { data, isLoading } = useQuery<AttendanceRecord>({
    queryKey: ['record', 'attendance', checkId],
  });

  return { result: data, isLoading };
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationKey: ['record', 'attendance'],
    mutationFn: (req: RecordAttendanceRequest) => record(req),
    onSuccess: (data, { checkId }) => {
      queryClient.setQueryData(['record', 'attendance', checkId], data);
    },
  });

  return { record: mutate, isLoading: isPending, error };
}

export function useGetAttendanceRecord(req: GetAttendanceRecordRequest) {
  const { data, isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['record', 'attendance', req],
    queryFn: () => getAllRecords(req),
  });

  return { attendanceRecords: data || [], isLoading };
}
