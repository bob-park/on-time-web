'use client';

import { useContext } from 'react';

import { FaCheckCircle } from 'react-icons/fa';
import { GiNightSleep } from 'react-icons/gi';
import { IoIosWarning } from 'react-icons/io';
import { IoIosTime } from 'react-icons/io';

import { getDaysOfWeek } from '@/utils/parse';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/query/attendanceRecord';
import { useGetCurrentUser } from '@/domain/user/query/user';
import cx from 'classnames';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { padStart } from 'lodash';

dayjs.extend(duration);

const DEFAULT_TIMES_LIST = new Array(12).fill('*');
const DEFAULT_WEEKENDS = [0, 6];
const DEFAULT_FAMILY_DAY_WEEKS = [0, 2];

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
          leaveWorkAt={item.leaveWorkAt}
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
        <div className="flex size-full flex-row items-center justify-center">
          {DEFAULT_TIMES_LIST.map((item, index) => (
            <div key={`schedule-working-time-am-${index}`} className="w-10 border-r-[1px] text-center">
              <span>{padWorkingTime(index === 0 ? 12 : index)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex size-full flex-col items-center justify-center">
        <div className="size-full w-full border-b-[1px] border-r-[1px] border-t-[1px] text-center">
          <span>PM</span>
        </div>
        <div className="flex size-full flex-row items-center justify-center">
          {DEFAULT_TIMES_LIST.map((item, index) => (
            <div key={`schedule-working-time-pm-${index}`} className="w-10 border-r-[1px] text-center">
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
        status: attendanceRecord.status,
        dayOffType: attendanceRecord.dayOffType,
        clockInTime: attendanceRecord.clockInTime,
        leaveWorkAt: attendanceRecord.leaveWorkAt,
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
  leaveWorkAt?: Date;
  clockOutTime?: Date;
}

const WorkingScheduleItem = ({
  date,
  dayOffType,
  status,
  clockInTime,
  leaveWorkAt,
  clockOutTime,
}: WorkingScheduleItemProps) => {
  const now = dayjs().hour(0).minute(0).second(0).millisecond(0);
  const clockIn =
    clockInTime ||
    (!DEFAULT_WEEKENDS.includes(dayjs(date).day()) && getTimelineTime(date, dayOffType === 'AM_HALF_DAY_OFF' ? 14 : 9));
  const clockOut =
    clockOutTime ||
    leaveWorkAt ||
    (!DEFAULT_WEEKENDS.includes(dayjs(date).day()) &&
      getTimelineTime(date, dayOffType === 'PM_HALF_DAY_OFF' || isFamilyDay(date) ? 14 : 18));

  return (
    <div
      className={cx('flex h-16 w-full flex-row rounded-xl duration-150 hover:bg-base-200', {
        'bg-base-200': now.isSame(date),
      })}
    >
      {/* working dates */}
      <div className="w-48 flex-none">
        <div className="flex size-full flex-row items-center justify-center border-r-[1px]">
          <div className="w-8 flex-none">
            {dayOffType === 'DAY_OFF' && <GiNightSleep className="size-6 text-gray-500" />}
            {!DEFAULT_WEEKENDS.includes(dayjs(date).day()) &&
              dayOffType !== 'DAY_OFF' &&
              (!status || status === 'WAITING') && <IoIosTime className="size-6 text-sky-600" />}
            {status === 'WARNING' && <IoIosWarning className="size-6 text-yellow-400" />}
            {status === 'SUCCESS' && <FaCheckCircle className="size-6 text-green-400" />}
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
      <div className={cx('w-[960px]', dayOffType === 'DAY_OFF' && 'invisible')}>
        <WorkingTimeItems date={date} status={status} clockIn={clockIn} clockOut={clockOut} />
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
    <div className="relative flex size-full flex-row items-center">
      {(!DEFAULT_WEEKENDS.includes(dayjs(date).day()) || (!!status && status !== 'WAITING')) && (
        <div
          className={cx({ tooltip: clockIn && clockOut }, 'absolute top-1/4 h-8 w-32 rounded-xl', {
            'bg-blue-300': status !== 'WARNING',
            'bg-yellow-300': status === 'WARNING',
          })}
          data-tip={`${clockIn && dayjs(clockIn).format('HH:mm')} - ${clockOut && dayjs(clockOut).format('HH:mm')} ${((!status || status === 'WAITING') && '(근무 예정)') || ''} `}
          style={{
            left: `${calculateTimeRatio(clockIn || dayjs().hour(9).toDate())}%`,
            width: `${calculateTimeRatio(clockOut || dayjs().hour(18).toDate()) - calculateTimeRatio(clockIn || dayjs().hour(9).toDate())}%`,
          }}
        ></div>
      )}
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

function calculateTimeRatio(date: Date) {
  const total = 24 * 3_600;
  const current = dayjs(date);

  const seconds = current.hour() * 3_600 + current.minute() * 60;

  return Math.round((seconds / total) * 100);
}

function isFamilyDay(date: Date) {
  const weeksOfMonth = dayjs.duration(dayjs(date).diff(dayjs(date).startOf('month'))).weeks();

  return DEFAULT_FAMILY_DAY_WEEKS.includes(weeksOfMonth) && dayjs(date).day() === 5;
}
