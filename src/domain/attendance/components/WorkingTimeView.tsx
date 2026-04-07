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
    <div className="flex w-full flex-row items-center justify-end gap-2">
      <button
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 transition-[colors,transform] duration-150"
        onClick={handlePrevWeekClick}
      >
        <IoIosArrowBack className="h-4 w-4" />
      </button>

      <span className="min-w-[220px] text-center text-sm font-medium text-slate-700">
        {`${dayjs(selectDate.startDate).format('YYYY.MM.DD')} – ${dayjs(selectDate.endDate).format('MM.DD')}`}
      </span>

      <button
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 transition-[colors,transform] duration-150"
        onClick={handleNextWeekClick}
      >
        <IoIosArrowForward className="h-4 w-4" />
      </button>

      <button
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-[colors,transform] duration-150"
        onClick={handleTodayClick}
      >
        오늘
      </button>
    </div>
  );
}
