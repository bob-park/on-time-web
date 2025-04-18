'use client';

import { useContext } from 'react';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';

import { getDaysOfWeek, getWeekStartDate } from '@/utils/parse';

import dayjs from 'dayjs';

export default function WorkingTimeView() {
  // context
  const { selectDate, updateSelectDate } = useContext(WorkingTimeContext);

  // handler
  const handlePrevWeekClick = () => {
    updateSelectDate({
      startDate: dayjs(selectDate.startDate).add(-7, 'day').toDate(),
      endDate: dayjs(selectDate.endDate).add(-7, 'day').toDate(),
    });
  };

  const handleNextWeekClick = () => {
    updateSelectDate({
      startDate: dayjs(selectDate.startDate).add(7, 'day').toDate(),
      endDate: dayjs(selectDate.endDate).add(7, 'day').toDate(),
    });
  };

  const handleTodayClick = () => {
    const startDate = getWeekStartDate(dayjs().toDate());

    updateSelectDate({ startDate, endDate: dayjs(startDate).add(6, 'day').toDate() });
  };

  return (
    <div className="flex w-full flex-row items-center justify-between gap-3">
      {/* working time date */}
      <div className="flex flex-row items-center justify-center gap-3 font-semibold">
        {/* 저번주 */}
        <button className="btn btn-neutral" onClick={handlePrevWeekClick}>
          <IoIosArrowBack className="26 h-6" />
          저번주
        </button>

        {/* date */}
        <div className="flex flex-row items-center justify-between gap-1">
          <span className="">{`${dayjs(selectDate.startDate).format('YYYY.MM.DD')} (${getDaysOfWeek(dayjs(selectDate.startDate).day())})`}</span>
          <span className=""> - </span>
          <span className="">{`${dayjs(selectDate.endDate).format('YYYY.MM.DD')} (${getDaysOfWeek(dayjs(selectDate.endDate).day())})`}</span>
        </div>

        {/* 다음주 */}
        <button className="btn btn-neutral" onClick={handleNextWeekClick}>
          다음주
          <IoIosArrowForward className="26 h-6" />
        </button>

        {/* 오늘 */}
        <button className="btn btn-neutral" onClick={handleTodayClick}>
          오늘
        </button>
      </div>
    </div>
  );
}
