'use client';

import dayjs from 'dayjs';

interface DayOffViewContentsProps {
  order: number;
  user: User;
  usedVacations: UsedVacation[];
}

function DualValue({ value, comp }: { value: number; comp: number }) {
  if (value === 0 && comp === 0) {
    return <span className="text-xs text-slate-300">—</span>;
  }
  return (
    <>
      <span className="text-sm text-slate-600">{value}</span>
      <span className="text-xs text-slate-400"> (</span>
      <span className="text-xs text-blue-400">{comp}</span>
      <span className="text-xs text-slate-400">)</span>
    </>
  );
}

export default function DayOffViewContents({ order, user, usedVacations }: DayOffViewContentsProps) {
  return (
    <tr className="group h-[52px] border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
      <td className="sticky left-0 z-10 w-12 bg-white px-3 text-center text-xs text-slate-400 group-hover:bg-slate-50">
        {order}
      </td>
      <td className="sticky left-[48px] z-10 w-20 border-r border-slate-200 bg-white px-3 text-center text-sm font-medium text-slate-800 group-hover:bg-slate-50">
        {user.username}
      </td>
      <td className="w-28 px-3 text-center text-sm text-slate-500">
        {user.employment ? dayjs(user.employment.effectiveDate).format('YYYY-MM-DD') : '—'}
      </td>
      <td className="w-24 px-3 text-center text-sm">
        <DualValue value={user.leaveEntry.totalLeaveDays} comp={user.leaveEntry.totalCompLeaveDays} />
      </td>
      <td className="w-24 px-3 text-center text-sm text-slate-500">0</td>
      <td className="w-24 border-r border-slate-200 px-3 text-center text-sm">
        <DualValue value={user.leaveEntry.totalLeaveDays} comp={user.leaveEntry.totalCompLeaveDays} />
      </td>

      {/* months */}
      {new Array(12).fill(null).map((_, index) => {
        const monthData = usedVacations.find((item) => item.month === index + 1);
        return (
          <td key={`month-${index}`} className="w-16 px-3 text-center text-sm">
            <DualValue value={monthData?.used ?? 0} comp={monthData?.usedComp ?? 0} />
          </td>
        );
      })}

      {/* 합계 */}
      <td className="w-24 border-l border-slate-200 px-3 text-center text-sm">
        <DualValue value={user.leaveEntry.usedLeaveDays} comp={user.leaveEntry.usedCompLeaveDays} />
      </td>

      {/* 잔여 */}
      <td className="w-24 px-3 text-center text-sm">
        <DualValue
          value={user.leaveEntry.totalLeaveDays - user.leaveEntry.usedLeaveDays}
          comp={user.leaveEntry.totalCompLeaveDays - user.leaveEntry.usedCompLeaveDays}
        />
      </td>
    </tr>
  );
}
