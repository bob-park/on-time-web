import { getAll } from '@/domain/attendance/api/attendanceGps';

import { useQuery } from '@tanstack/react-query';

export function useGetAttendanceGps() {
  const { data, isLoading } = useQuery<AttendanceGps[]>({
    queryKey: ['attendance', 'gps'],
    queryFn: () => getAll(),
  });

  return { gpsResult: data || [], isLoading };
}
