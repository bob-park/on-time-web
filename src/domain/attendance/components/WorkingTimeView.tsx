'use client';

import { useContext } from 'react';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { getWeekStartDate } from '@/utils/parse';

import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

export default function WorkingTimeView() {
  // hooks
  const t = useTranslations('common');

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
        className="bg-base-300 text-base-content hover:bg-base-content/10 flex h-9 w-9 items-center justify-center rounded-full transition-[colors,transform] duration-150 active:scale-95"
        onClick={handlePrevWeekClick}
      >
        <IoIosArrowBack className="h-4 w-4" />
      </button>

      <span className="min-w-[180px] text-center text-sm font-bold">
        {`${dayjs(selectDate.startDate).format('YYYY.MM.DD')} – ${dayjs(selectDate.endDate).format('MM.DD')}`}
      </span>

      <button
        className="bg-base-300 text-base-content hover:bg-base-content/10 flex h-9 w-9 items-center justify-center rounded-full transition-[colors,transform] duration-150 active:scale-95"
        onClick={handleNextWeekClick}
      >
        <IoIosArrowForward className="h-4 w-4" />
      </button>

      <button className="btn btn-sm btn-outline" onClick={handleTodayClick}>
        {t('today')}
      </button>
    </div>
  );
}
