'use client';

import { createContext, useContext, useMemo, useState } from 'react';

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
  const { startDate, endDate, onChange } = useContext(MonthPickerContext);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 select-none">
      {/* year */}
      <div className="w-full text-center">
        <h3 className="text-2xl font-bold">{dayjs(startDate).format('YYYY')}</h3>
      </div>

      {/* month */}
      <div className="mt-5 flex w-full flex-row items-center justify-center gap-3">
        {new Array(12).fill('0').map((_, index) => (
          <div key={`month-picker-item-${index}`} className="p-2">
            <div className="hover:bg-base-300 flex h-12 w-16 items-center justify-center rounded-2xl text-center transition-all duration-150">
              <span>{index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
