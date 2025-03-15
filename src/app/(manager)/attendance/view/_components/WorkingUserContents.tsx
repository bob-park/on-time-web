'use client';

import { useContext } from 'react';

import { FaCheckCircle } from 'react-icons/fa';
import { GiNightSleep } from 'react-icons/gi';
import { IoIosTime } from 'react-icons/io';
import { RiErrorWarningFill } from 'react-icons/ri';

import { SelectUserContext } from '@/app/(manager)/attendance/view/_components/SelectUsers';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/query/attendanceRecord';

import { isIncludeTime } from '@/utils/dataUtils';
import { getDaysOfWeek, getDuration } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import { padStart } from 'lodash';

const ONE_HOUR = 3_600;
const DEFAULT_WEEK_ENDS = [0, 6];

function parseTimeFormat(seconds: number): string {
  const min = Math.floor((seconds / 60) % 60);
  const hours = Math.floor(seconds / 3_600);

  return `${hours}시간 ${padStart(min + '', 2, '0')}분`;
}

const DisplayStatus = ({ status, dayOffType }: { status?: AttendanceStatus; dayOffType?: DayOffType }) => {
  if (dayOffType === 'DAY_OFF') {
    return (
      <span className="font-semibold">
        <GiNightSleep className="inline-block size-6 pl-1 text-gray-600" />
        휴가
      </span>
    );
  }

  if (!status) {
    return (
      <span className="font-semibold">
        근무 예정
        <IoIosTime className="inline-block size-6 pl-1 text-sky-600" />
      </span>
    );
  }

  switch (status) {
    case 'WARNING':
      return (
        <span className="font-semibold">
          경고
          <RiErrorWarningFill className="inline-block size-6 pl-1 text-red-500" />
        </span>
      );
    case 'SUCCESS':
      return (
        <span className="font-semibold">
          완벽
          <FaCheckCircle className="inline-block size-6 pl-1 text-green-500" />
        </span>
      );
    default:
      return (
        <span className="font-semibold">
          근무 예정
          <IoIosTime className="inline-block size-6 pl-1 text-sky-600" />
        </span>
      );
  }
};

const WorkingUserHeaders = () => {
  return (
    <div className="flex h-16 w-full flex-row items-center gap-1 border-y-2 border-gray-300 px-2 text-center font-semibold">
      <span className="w-32 flex-none">근무일</span>
      <span className="w-16 flex-none">구분</span>
      <span className="w-28 flex-none">출근 시간</span>
      <span className="w-28 flex-none">퇴근 예정 시간</span>
      <span className="w-28 flex-none">퇴근 시간</span>
      <span className="w-12 flex-none">휴식</span>
      <span className="w-16 flex-none">연장 근로</span>
      <span className="w-28 flex-none">총 근무 시간</span>
      <span className="w-28 flex-none">근무 상태</span>
    </div>
  );
};

interface WorkingUserItemProps {
  date: Date;
  status?: AttendanceStatus;
  clockIn?: Date;
  leaveWorkAt?: Date;
  clockOut?: Date;
  dayOffType?: DayOffType;
}

const WorkingUserItem = ({ date, status, clockIn, leaveWorkAt, clockOut, dayOffType }: WorkingUserItemProps) => {
  const now = dayjs().hour(0).minute(0).second(0).millisecond(0);
  const workDurations = clockIn && clockOut && getDuration(clockIn, clockOut);

  return (
    <div
      className={cx(
        'hover:bg-base-200 flex h-16 w-full flex-row items-center gap-1 rounded-2xl px-2 text-center transition-all duration-150',
        {
          'bg-base-200': now.isSame(date),
        },
      )}
    >
      <div
        className={cx('w-32 flex-none font-semibold', {
          'text-blue-500': dayjs(date).day() === 6,
          'text-red-500': dayjs(date).day() === 0,
        })}
      >
        <span>{dayjs(date).format('YYYY-MM-DD')}</span>
        <span> </span>
        <span className="text-sm">
          (<span>{getDaysOfWeek(dayjs(date).day())}</span>)
        </span>
      </div>
      <div className="w-16 flex-none font-semibold">
        <span className="">
          {DEFAULT_WEEK_ENDS.includes(dayjs(date).day()) ? '휴일' : dayOffType === 'DAY_OFF' ? '휴가' : '업무'}
        </span>
      </div>
      <div className="w-28 flex-none">
        <span>{clockIn && dayjs(clockIn).format('HH:mm')}</span>
      </div>
      <div className="w-28 flex-none">
        <span>{leaveWorkAt && dayjs(leaveWorkAt).format('HH:mm')}</span>
      </div>
      <div className="w-28 flex-none">
        <span>{clockOut && dayjs(clockOut).format('HH:mm')}</span>
      </div>
      <div className="w-12 flex-none">
        <span className="">
          {(workDurations && workDurations > ONE_HOUR * 8) ||
          isIncludeTime(
            { from: clockIn || dayjs(date).hour(0).toDate(), to: clockOut || dayjs(date).hour(0).toDate() },
            dayjs(date).hour(12).toDate(),
          )
            ? 1
            : 0}
          시간
        </span>
      </div>
      <div className="w-16 flex-none">0분</div>
      <div className="w-28 flex-none">
        <span>
          {workDurations &&
            parseTimeFormat(
              workDurations -
                (workDurations > ONE_HOUR * 8 ||
                isIncludeTime(
                  {
                    from: clockIn || dayjs(date).hour(0).toDate(),
                    to: clockOut || dayjs(date).hour(0).toDate(),
                  },
                  dayjs(date).hour(12).toDate(),
                )
                  ? ONE_HOUR
                  : 0),
            )}
        </span>
      </div>
      <div className="w-28 flex-none">
        <DisplayStatus status={status} dayOffType={dayOffType} />
      </div>
    </div>
  );
};

function getDates(selectDate: { startDate: Date; endDate: Date }, attendanceRecords: AttendanceRecord[]) {
  const result = new Array<WorkingUserItemProps>();

  let currentDate = dayjs(selectDate.startDate).hour(0).minute(0).second(0).millisecond(0).toDate();

  while (currentDate <= selectDate.endDate) {
    const attendanceRecord = attendanceRecords.find(
      (item) => dayjs(item.workingDate).format('YYYY-MM-DD') === dayjs(currentDate).format('YYYY-MM-DD'),
    );

    if (!attendanceRecord) {
      result.push({ date: currentDate });
    } else {
      result.push({
        date: currentDate,
        clockIn: attendanceRecord.clockInTime,
        clockOut: attendanceRecord.clockOutTime,
        leaveWorkAt: attendanceRecord.leaveWorkAt,
        status: attendanceRecord.status,
        dayOffType: attendanceRecord.dayOffType,
      });
    }

    currentDate = dayjs(currentDate).add(1, 'day').toDate();
  }

  return result;
}

export default function WorkingUserContents() {
  // context
  const { selectedUser } = useContext(SelectUserContext);
  const { selectDate } = useContext(WorkingTimeContext);

  // query
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: selectedUser?.uniqueId,
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });

  const dataList = getDates(selectDate, attendanceRecords);

  return (
    <div className="flex w-full flex-col items-center justify-start gap-1">
      {/* header */}
      <WorkingUserHeaders />

      {/* contents */}
      <div className="flex flex-col items-center justify-start gap-1">
        {!selectedUser && (
          <div className="flex h-32 flex-col items-center justify-center gap-1 text-gray-500">
            <div className="text-2xl font-bold">아무도 선택하지 않았🐮</div>
          </div>
        )}
        {selectedUser &&
          dataList.map((item) => <WorkingUserItem key={`working-user-item-${dayjs(item.date).unix()}`} {...item} />)}
      </div>
    </div>
  );
}
