import { currentCheck } from '@/domain/attendance/api/attendanceCheck';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
