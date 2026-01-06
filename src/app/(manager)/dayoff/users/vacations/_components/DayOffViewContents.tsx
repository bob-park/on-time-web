'use client';

import dayjs from 'dayjs';

interface DayOffViewContentsProps {
  order: number;
  user: User;
  usedVacations: UsedVacation[];
}

export default function DayOffViewContents({ order, user, usedVacations }: DayOffViewContentsProps) {
  return (
    <div className="hover:bg-base-300 relative flex h-12 w-max flex-row items-center gap-2 rounded-2xl font-semibold transition-all duration-150 select-none">
      <div className="hover:bg-base-300 sticky left-0 z-10 flex h-full flex-row items-center gap-2 rounded-l-2xl backdrop-blur-2xl">
        <div className="w-12 flex-none text-center">{order}</div>
        <div className="w-20 flex-none text-center">{user.username}</div>
      </div>

      <div className="w-28 flex-none text-center">
        {user.employment && dayjs(user.employment.effectiveDate).format('YYYY-MM-DD')}
      </div>
      <div className="w-24 flex-none text-center">
        {/* 연차 */}
        <span className="">{user.leaveEntry.totalLeaveDays}</span>

        {/* 보상휴가 */}
        <span className="text-sm">
          <span>(</span>
          <span className="text-blue-600">{user.leaveEntry.totalCompLeaveDays}</span>
          <span>)</span>
        </span>
      </div>
      <div className="w-24 flex-none text-center">0</div>
      <div className="w-24 flex-none text-center">
        {/* 연차 */}
        <span className="">{user.leaveEntry.totalLeaveDays}</span>

        {/* 보상휴가 */}
        <span className="text-sm">
          <span>(</span>
          <span className="text-blue-600">{user.leaveEntry.totalCompLeaveDays}</span>
          <span>)</span>
        </span>
      </div>

      {/* months */}
      {new Array(12).fill('0').map((_, index) => (
        <div key={`month-item-${index}`} className="w-16 flex-none text-center">
          {usedVacations
            .filter((item) => item.month === index + 1)
            .map((item) => (
              <div key={`user-${index}-vacation-contents`}>
                {/* 연차 */}
                <span className="">{item.used}</span>

                {/* 보상휴가 */}
                <span className="text-sm">
                  <span>(</span>
                  <span className="text-blue-600">{item.usedComp}</span>
                  <span>)</span>
                </span>
              </div>
            ))}
        </div>
      ))}

      {/* total */}
      <div className="w-24 flex-none text-center">
        {/* 연차 */}
        <span className="">{user.leaveEntry.usedLeaveDays}</span>

        {/* 보상휴가 */}
        <span className="text-sm">
          <span>(</span>
          <span className="text-blue-600">{user.leaveEntry.usedCompLeaveDays}</span>
          <span>)</span>
        </span>
      </div>
      <div className="w-24 flex-none text-center">
        {/* 연차 */}
        <span className="">{user.leaveEntry.totalLeaveDays - user.leaveEntry.usedLeaveDays}</span>

        {/* 보상휴가 */}
        <span className="text-sm">
          <span>(</span>
          <span className="text-blue-600">
            {user.leaveEntry.totalCompLeaveDays - user.leaveEntry.usedCompLeaveDays}
          </span>
          <span>)</span>
        </span>
      </div>
    </div>
  );
}
