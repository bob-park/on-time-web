import { useQuery } from '@tanstack/react-query';

import { getAll } from '@/domain/attendance/api/attendanceGps';

export function useGetAttendanceGps() {
  const { data, isLoading } = useQuery<AttendanceGps[]>({
    queryKey: ['attendance', 'gps'],
    queryFn: () => getAll(),
  });

  return { gpsResult: data || [], isLoading };
}
