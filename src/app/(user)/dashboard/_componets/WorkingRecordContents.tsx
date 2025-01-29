'use client';

import { useContext } from 'react';

import { FaCheckCircle, FaThumbsUp } from 'react-icons/fa';
import { RiErrorWarningFill } from 'react-icons/ri';

import { useStore } from '@/shared/rootStore';

import { getDaysOfWeek, getDuration, parseTimeFormat } from '@/utils/parse';

import { useGetAttendanceRecord } from '@/domain/attendance/query/AttendanceRecord';
import cx from 'classnames';
import dayjs from 'dayjs';

import { WorkingTimeContext } from './WorkingTimeProvider';

const ONE_HOUR = 3_600;

function WorkingRecordHeaders() {
  return (
    <div className="flex h-14 w-full flex-row items-center justify-center gap-1 border-y-2 border-y-gray-300 text-center font-semibold">
      <span className="w-8 flex-none"></span>
      <span className="w-32 flex-none">근무일</span>
      <span className="w-12 flex-none">구분</span>
      <span className="w-28 flex-none">출근 시간</span>
      <span className="w-28 flex-none">퇴근 예정 시간</span>
      <span className="w-28 flex-none">퇴근 시간</span>
      <span className="w-12 flex-none">휴식</span>
      <span className="w-16 flex-none">연장 근로</span>
      <span className="w-28 flex-none">근무 시간</span>
    </div>
  );
}

interface WorkingRecordItemsProps {
  date: Date;
  clockInTime?: Date;
  leaveWorkAt?: Date;
  clockOutTime?: Date;
  status?: AttendanceStatus;
  dayOffType?: DayOffType;
}

function WorkingRecordItems({
  date,
  clockInTime,
  leaveWorkAt,
  clockOutTime,
  status,
  dayOffType,
}: WorkingRecordItemsProps) {
  return (
    <div className="flex h-14 w-full flex-row items-center justify-center gap-1 rounded-xl text-center duration-150 hover:bg-base-200">
      <span className="w-8 flex-none">
        {status && <>{status === 'SUCCESS' && <FaCheckCircle className="h-6 w-6 text-green-600" />}</>}
        {status && <>{status === 'WARNING' && <RiErrorWarningFill className="h-6 w-6 text-red-600" />}</>}
      </span>
      <span
        className={cx('w-32 flex-none font-semibold', {
          'text-blue-600': dayjs(date).day() === 6,
          'text-red-600': dayjs(date).day() === 0,
        })}
      >
        {`${dayjs(date).format('YYYY.MM.DD')} (${getDaysOfWeek(dayjs(date).day())})`}
      </span>
      <span className="w-12 flex-none font-semibold">{[0, 6].includes(dayjs(date).day()) ? '휴일' : '업무'}</span>
      <span className="w-28 flex-none">{clockInTime && dayjs(clockInTime).format('HH:mm:ss')}</span>
      <span className="w-28 flex-none">{leaveWorkAt && dayjs(leaveWorkAt).format('HH:mm:ss')}</span>
      <span className="w-28 flex-none">{clockOutTime && dayjs(clockOutTime).format('HH:mm:ss')}</span>
      <span className="w-12 flex-none">1시간</span>
      <span className="w-16 flex-none">0분</span>
      <span className="w-28 flex-none">
        {clockInTime &&
          clockOutTime &&
          parseTimeFormat(getDuration(clockInTime, clockOutTime) - (dayOffType ? 0 : ONE_HOUR))}
      </span>
    </div>
  );
}

function getDates(selectDate: { startDate: Date; endDate: Date }, attendanceRecords: AttendanceRecord[]) {
  const result = new Array<WorkingRecordItemsProps>();

  let currentDate = dayjs(selectDate.startDate).clone().toDate();

  while (currentDate <= selectDate.endDate) {
    const attendanceRecord = attendanceRecords.find(
      (item) => dayjs(item.workingDate).format('YYYY-MM-DD') === dayjs(currentDate).format('YYYY-MM-DD'),
    );

    if (!attendanceRecord) {
      result.push({ date: currentDate });
    } else {
      result.push({
        date: currentDate,
        clockInTime: attendanceRecord.clockInTime,
        clockOutTime: attendanceRecord.clockOutTime,
        leaveWorkAt: attendanceRecord.leaveWorkAt,
        status: attendanceRecord.status,
        dayOffType: attendanceRecord.dayOffType,
      });
    }

    currentDate = dayjs(currentDate).add(1, 'day').toDate();
  }

  return result;
}

export default function WorkingRecordContents() {
  // context
  const { selectDate } = useContext(WorkingTimeContext);

  // store
  const currentUser = useStore((state) => state.currentUser);

  // query
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: currentUser?.uniqueId || '',
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });

  const dataList = getDates(selectDate, attendanceRecords);

  return (
    <div className="mt-5 flex w-full max-w-[860px] flex-col items-center justify-center gap-1">
      {/* header */}
      <WorkingRecordHeaders />

      {/* contents */}
      {dataList.map((item) => (
        <WorkingRecordItems
          key={`working-record-key-${dayjs(item.date).unix()}`}
          date={item.date}
          clockInTime={item.clockInTime}
          leaveWorkAt={item.leaveWorkAt}
          clockOutTime={item.clockOutTime}
          status={item.status}
          dayOffType={item.dayOffType}
        />
      ))}
    </div>
  );
}
