'use client';

import { createContext, useMemo, useState } from 'react';

import { getWeekStartDate } from '@/utils/parse';

import dayjs from 'dayjs';

export type WorkingTimeViewType = 'week' | 'month' | 'calendar';

interface WorkingTimeContextProps {
  timeView: WorkingTimeViewType;
  selectDate: {
    startDate: Date;
    endDate: Date;
  };
  updateTimeView: (timeView: WorkingTimeViewType) => void;
  updateSelectDate: ({ startDate, endDate }: { startDate: Date; endDate: Date }) => void;
}

const initialState: WorkingTimeContextProps = {
  timeView: 'week',
  selectDate: {
    startDate: getWeekStartDate(new Date()),
    endDate: dayjs(getWeekStartDate(new Date())).add(6, 'day').toDate(),
  },
  updateTimeView: () => {},
  updateSelectDate: () => {},
};

export const WorkingTimeContext = createContext<WorkingTimeContextProps>(initialState);

export default function WorkingTimeProvider({ children }: { children: React.ReactNode }) {
  // state
  const [timeView, setTimeView] = useState<WorkingTimeViewType>();
  const [selectDate, setSelectDate] = useState<{ startDate: Date; endDate: Date }>();

  // handle
  const handleUpdateTimeView = (type: WorkingTimeViewType) => {
    setTimeView(type);
  };

  const handleUpdateSelectDate = (dates: { startDate: Date; endDate: Date }) => {
    setSelectDate(dates);
  };

  const contextValue = useMemo(
    () => ({
      timeView: timeView || initialState.timeView,
      selectDate: selectDate || initialState.selectDate,
      updateTimeView: handleUpdateTimeView,
      updateSelectDate: handleUpdateSelectDate,
    }),
    [timeView, selectDate],
  );

  return <WorkingTimeContext.Provider value={contextValue}>{children}</WorkingTimeContext.Provider>;
}
