import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AttendanceCheck, CurrentAttendanceCheckRequest } from '@/domain/attendance/apis/attendance.dto';
import { currentCheck } from '@/domain/attendance/apis/attendanceCheck';

export function useGetCurrentCheck() {
  const { data, isLoading } = useQuery<AttendanceCheck>({ queryKey: ['current', 'attendance', 'check'] });

  return { currentCheck: data, isLoading };
}

export function useGenerateCurrentCheck(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['current', 'attendance', 'check'],
    mutationFn: (req: CurrentAttendanceCheckRequest) => currentCheck(req),

    onSuccess: async (data) => {
      queryClient.setQueryData(['current', 'attendance', 'check'], data);

      onSuccess && onSuccess();
    },
  });

  return { generateCheck: mutate, isLoading: isPending };
}
