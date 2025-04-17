'use client';

import { createContext, useContext, useMemo, useState } from 'react';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import cx from 'classnames';
import dayjs from 'dayjs';

interface MonthPickerValue {
  startDate: Date;
  endDate: Date;
  onChange?: (date: Date) => void;
}

export const MonthPickerContext = createContext<MonthPickerValue>({
  startDate: dayjs().startOf('month').toDate(),
  endDate: dayjs().endOf('month').toDate(),
});

export function MonthPickerProvider({ children }: { children: React.ReactNode }) {
  // state
  const [startDate, setStartDate] = useState<Date>(dayjs().startOf('month').toDate());
  const [endDate, setEndDate] = useState<Date>(dayjs().endOf('month').toDate());

  // handle
  const handleChange = (date: Date) => {
    setStartDate(dayjs(date).startOf('month').toDate());
    setEndDate(dayjs(date).endOf('month').toDate());
  };

  // memorized
  const memorizedValue = useMemo(() => ({ startDate, endDate, onChange: handleChange }), [startDate, endDate]);

  return <MonthPickerContext.Provider value={memorizedValue}>{children}</MonthPickerContext.Provider>;
}

export default function MonthPicker() {
  // context
  const { startDate, onChange } = useContext(MonthPickerContext);

  // handle
  const handlePrevClick = () => {
    onChange && onChange(dayjs(startDate).subtract(1, 'year').startOf('year').toDate());
  };

  const handleNextClick = () => {
    onChange && onChange(dayjs(startDate).add(1, 'year').startOf('year').toDate());
  };

  const handleChange = (date: Date) => {
    onChange && onChange(date);
  };

  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 select-none">
      {/* year */}
      <div className="w-full text-center">
        <div className="flex flex-row items-center justify-center gap-10">
          <button className="btn btn-neutral" onClick={handlePrevClick}>
            <IoIosArrowBack className="size-6" />
          </button>
          <h3 className="text-2xl font-bold">{dayjs(startDate).format('YYYY')}년</h3>
          <button className="btn btn-neutral" onClick={handleNextClick}>
            <IoIosArrowForward className="size-6" />
          </button>
        </div>
      </div>

      {/* month */}
      <div className="mt-3 flex w-full flex-row items-center justify-center gap-1">
        {new Array(12).fill('0').map((_, index) => (
          <div key={`month-picker-item-${index}`} className="p-1">
            <div
              className={cx(
                'hover:bg-base-300 flex h-12 w-16 cursor-pointer items-center justify-center rounded-2xl text-center transition-all duration-150',
                {
                  'bg-base-300': dayjs(startDate).isSame(dayjs(startDate).month(index), 'month'),
                },
              )}
              onClick={() => handleChange(dayjs(startDate).month(index).toDate())}
            >
              <span className="font-semibold">{index + 1} 월</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
