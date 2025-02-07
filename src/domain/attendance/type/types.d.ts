type AttendanceType = 'CLOCK_IN' | 'CLOCK_OUT'
type AttendanceCheckType = 'QR' | 'GPS' | 'WIFI';
type AttendanceStatus = 'WAITING' | 'SUCCESS' | 'WARNING';
type DayOffType = 'DAY_OFF' | 'AM_HALF_DAY_OFF' | 'PM_HALF_DAY_OFF';

/*
 * attendance check
 */
interface AttendanceCheck {
  id: string;
  type: AttendanceCheckType;
  attendance: AttendanceCheckType;
  workingDate: Date;
  expiredDate: Date;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}

interface CurrentAttendanceCheckRequest {
  type: AttendanceCheckType;
  attendanceType: AttendanceType;
}


/*
 * attendance record
 */
interface RecordAttendanceRequest {
  checkId: string;
}

interface AttendanceRecord {
  id: number;
  userUniqueId: string;
  status: AttendanceStatus;
  dayOffType?: DayOffType;
  workingDate: Date;
  clockInTime?: Date
  leaveWorkAt?: Date;
  clockOutTime?: Date;
  message?: string;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}

type GetAttendanceRecordRequest = {
  startDate: string;
  endDate: string;
  userUniqueId: string;
}

/*
 * attendance gps
 */
interface AttendanceGps {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}
