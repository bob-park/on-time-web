import { addSchedule, getAllRecords, record } from '@/domain/attendance/api/attendanceRecord';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGetResultAttendanceRecord({ checkId }: { checkId: string }) {
  const { data, isLoading } = useQuery<AttendanceRecord>({
    queryKey: ['record', 'attendance', checkId],
  });

  return { result: data, isLoading };
}

export function useRecordAttendance(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationKey: ['record', 'attendance'],
    mutationFn: (req: RecordAttendanceRequest) => record(req),
    onSuccess: (data, { checkId }) => {
      queryClient.invalidateQueries({ queryKey: ['record', 'attendance'] });

      onSuccess && onSuccess();
    },
  });

  return { record: mutate, isLoading: isPending, error };
}

export function useGetAttendanceRecord(req: GetAttendanceRecordRequest) {
  const { data, isLoading, refetch } = useQuery<AttendanceRecord[]>({
    queryKey: ['record', 'attendance', req],
    queryFn: () => getAllRecords(req),
    enabled: !!req.userUniqueId,
  });

  return { attendanceRecords: data || ([] as AttendanceRecord[]), isLoading, reloadRecord: refetch };
}

export function useAddAttendanceSchedule(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['attendance', 'schedule', 'add'],
    mutationFn: (req: AddAttendanceScheduleRequest) => addSchedule(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record', 'attendance'] });

      onSuccess && onSuccess();
    },
  });

  return { addSchedule: mutate, isLoading: isPending };
}
