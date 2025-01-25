type AttendanceType = 'CLOCK_IN' | 'CLOCK_OUT'

type AttendanceCheckType = 'QR' | 'GPS' | 'WIFI';

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
