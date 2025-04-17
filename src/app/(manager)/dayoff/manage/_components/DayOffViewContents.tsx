'use client';

import dayjs from 'dayjs';

interface DayOffViewContentsProps {
  order: number;
  user: User;
}

export default function DayOffViewContents({ order, user }: DayOffViewContentsProps) {
  return (
    <div className="relative flex h-12 w-max flex-row items-center gap-2 rounded-2xl font-semibold transition-all duration-150 select-none">
      <div className="sticky left-0 z-10 flex flex-row items-center gap-2 bg-white/90 backdrop-blur-xl">
        <div className="w-12 flex-none text-center">{order}</div>
        <div className="w-20 flex-none text-center">{user.username}</div>
      </div>

      <div className="w-28 flex-none text-center">
        {user.employment && dayjs(user.employment.effectiveDate).format('YYYY-MM-DD')}
      </div>
      <div className="w-24 flex-none text-center">{user.leaveEntry.totalLeaveDays}</div>
      <div className="w-24 flex-none text-center">0</div>
      <div className="w-24 flex-none text-center">{user.leaveEntry.totalLeaveDays}</div>

      {/* months */}
      {new Array(12).fill('0').map((_, index) => (
        <div key={`month-item-${index}`} className="w-16 flex-none text-center"></div>
      ))}

      {/* total */}
      <div className="w-24 flex-none text-center">{user.leaveEntry.usedLeaveDays}</div>
      <div className="w-24 flex-none text-center">{user.leaveEntry.totalLeaveDays - user.leaveEntry.usedLeaveDays}</div>
    </div>
  );
}
