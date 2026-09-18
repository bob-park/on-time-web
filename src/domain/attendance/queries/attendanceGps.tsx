import { useQuery } from '@tanstack/react-query';

import { AttendanceGps } from '@/domain/attendance/apis/attendance.dto';
import { getAll } from '@/domain/attendance/apis/attendanceGps';

export function useGetAttendanceGps() {
  const { data, isLoading } = useQuery<AttendanceGps[]>({
    queryKey: ['attendance', 'gps'],
    queryFn: () => getAll(),
  });

  return { gpsResult: data || [], isLoading };
}
