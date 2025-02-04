'use client';

import { useContext } from 'react';

import { IoIosWarning } from 'react-icons/io';
import { IoIosTime } from 'react-icons/io';

import { getDaysOfWeek } from '@/utils/parse';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/query/attendanceRecord';
import { useGetCurrentUser } from '@/domain/user/query/user';
import cx from 'classnames';
import dayjs from 'dayjs';
import { padStart } from 'lodash';

const DEFAULT_TIMES_LIST = new Array(12).fill('*');
const DEFAULT_WEEKENDS = [0, 6];

export default function ScheduleContents() {
  const { selectDate } = useContext(WorkingTimeContext);

  // query
  const { currentUser } = useGetCurrentUser();
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: currentUser?.uniqueId || '',
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });

  const dataList = getDates(selectDate, attendanceRecords);

  return (
    <div className="flex select-none flex-col items-start justify-center gap-1 border-gray-300">
      {/* headers */}
      <div className="flex h-16 flex-row">
        {/* working dates */}
        <div className="w-48 flex-none border-[1px]">
          <div className="flex size-full items-center justify-center">
            <span className="">근무일</span>
          </div>
        </div>

        {/* working times */}
        <div className="border-b-[1px]">
          <WorkingTimeHeaders />
        </div>
      </div>

      {/* contents */}
      {dataList.map((item, index) => (
        <WorkingScheduleItem
          key={`working-schedule-item-${index}`}
          date={item.date}
          status={item.status}
          dayOffType={item.dayOffType}
          clockInTime={item.clockInTime}
          clockOutTime={item.clockOutTime}
        />
      ))}
    </div>
  );
}

function padWorkingTime(value: number): string {
  return padStart(value + '', 2, '0');
}

const WorkingTimeHeaders = () => {
  return (
    <div className="flex size-full flex-row items-center justify-center">
      <div className="flex size-full flex-col items-center justify-center">
        <div className="size-full border-b-[1px] border-r-[1px] border-t-[1px] text-center">
          <span>AM</span>
        </div>
        <div className="flex size-full flex-row">
          {DEFAULT_TIMES_LIST.map((item, index) => (
            <div key={`schedule-working-time-am-${index}`} className="w-12 border-r-[1px] text-center">
              <span>{padWorkingTime(index === 0 ? 12 : index)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="justify-cente flex size-full flex-col items-center">
        <div className="size-full w-full border-b-[1px] border-r-[1px] border-t-[1px] text-center">
          <span>PM</span>
        </div>
        <div className="flex size-full flex-row">
          {DEFAULT_TIMES_LIST.map((item, index) => (
            <div key={`schedule-working-time-pm-${index}`} className="w-12 border-r-[1px] text-center">
              <span>{padWorkingTime(index === 0 ? 12 : index)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function getDates(selectDate: { startDate: Date; endDate: Date }, attendanceRecords: AttendanceRecord[]) {
  const result = new Array<WorkingScheduleItemProps>();

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
        status: attendanceRecord.status,
        dayOffType: attendanceRecord.dayOffType,
        clockInTime: attendanceRecord.clockInTime,
        clockOutTime: attendanceRecord.clockOutTime,
      });
    }

    currentDate = dayjs(currentDate).add(1, 'day').toDate();
  }

  return result;
}

interface WorkingScheduleItemProps {
  date: Date;
  dayOffType?: DayOffType;
  status?: AttendanceStatus;
  clockInTime?: Date;
  clockOutTime?: Date;
}

const WorkingScheduleItem = ({ date, dayOffType, status, clockInTime, clockOutTime }: WorkingScheduleItemProps) => {
  const clockIn = clockInTime || (!DEFAULT_WEEKENDS.includes(dayjs(date).day()) && getTimelineTime(date, 9));
  const clockOut = clockOutTime || (!DEFAULT_WEEKENDS.includes(dayjs(date).day()) && getTimelineTime(date, 18));

  return (
    <div
      className={cx({ tooltip: clockIn && clockOut })}
      data-tip={`${clockIn && dayjs(clockIn).format('HH:mm')} - ${clockOut && dayjs(clockOut).format('HH:mm')} ${((!status || status === 'WAITING') && '(근무 예정)') || ''} `}
    >
      <div className="flex h-16 flex-row rounded-xl duration-150 hover:bg-base-200">
        {/* working dates */}
        <div className="w-48 flex-none">
          <div className="flex size-full flex-row items-center justify-center border-r-[1px]">
            <div className="w-8 flex-none">
              {!DEFAULT_WEEKENDS.includes(dayjs(date).day()) && (!status || status === 'WAITING') && (
                <IoIosTime className="size-6 text-sky-600" />
              )}
              {status === 'WARNING' && <IoIosWarning className="size-6 text-yellow-400" />}
            </div>
            <div
              className={cx('w-32 flex-none font-semibold', {
                'text-blue-600': dayjs(date).day() === 6,
                'text-red-600': dayjs(date).day() === 0,
              })}
            >{`${dayjs(date).format('YYYY-MM-DD')} (${getDaysOfWeek(dayjs(date).day())})`}</div>
          </div>
        </div>

        {/* working times */}
        <div className="">
          <WorkingTimeItems date={date} status={status} clockIn={clockIn} clockOut={clockOut} />
        </div>
      </div>
    </div>
  );
};

interface WorkingTimeItemsProps {
  date: Date;
  status?: AttendanceStatus;
  clockIn?: Date | false;
  clockOut?: Date | false;
}

const WorkingTimeItems = ({ date, status, clockIn, clockOut }: WorkingTimeItemsProps) => {
  return (
    <div className="flex size-full flex-row items-center">
      <div className="flex size-full flex-col items-center">
        <div className="flex size-full flex-row items-center justify-center">
          {DEFAULT_TIMES_LIST.map((item, index) => (
            <p
              key={`schedule-working-time-am-${index}`}
              className={cx(
                'h-8 w-12',
                {
                  'bg-blue-400':
                    status !== 'WARNING' && isActive({ clockIn, clockOut }, getTimelineTime(date, index + 1)),
                },
                {
                  'bg-yellow-400':
                    status === 'WARNING' && isActive({ clockIn, clockOut }, getTimelineTime(date, index + 1)),
                },
              )}
            ></p>
          ))}
        </div>
      </div>
      <div className="justify-cente flex size-full flex-col">
        <div className="flex size-full flex-row items-center justify-center">
          {DEFAULT_TIMES_LIST.map((item, index) => (
            <p
              key={`schedule-working-time-pm-${index}`}
              className={cx(
                'h-8 w-12',
                {
                  'bg-blue-400':
                    status !== 'WARNING' && isActive({ clockIn, clockOut }, getTimelineTime(date, index + 12)),
                },
                {
                  'bg-yellow-400':
                    status === 'WARNING' && isActive({ clockIn, clockOut }, getTimelineTime(date, index + 12)),
                },
              )}
            ></p>
          ))}
        </div>
      </div>
    </div>
  );
};

function getTimelineTime(date: Date, hours: number, minutes: number = 0): Date {
  return dayjs(new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    .set('hours', hours)
    .set('minutes', minutes)
    .set('seconds', 0)
    .toDate();
}

function isActive({ clockIn, clockOut }: { clockIn?: Date | false; clockOut?: Date | false }, time: Date): boolean {
  if (!clockIn || !clockOut) {
    return false;
  }

  return dayjs(time).isAfter(clockIn) && dayjs(time).isBefore(clockOut);
}
