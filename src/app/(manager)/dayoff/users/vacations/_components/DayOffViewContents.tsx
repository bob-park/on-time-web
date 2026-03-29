'use client';

import dayjs from 'dayjs';

interface DayOffViewContentsProps {
  order: number;
  user: User;
  usedVacations: UsedVacation[];
}

function DualValue({ value, comp }: { value: number; comp: number }) {
  if (value === 0 && comp === 0) {
    return <span className="text-[12px] text-slate-300">—</span>;
  }
  return (
    <>
      <span className="text-[13px] text-slate-600">{value}</span>
      <span className="text-[11px] text-slate-400"> (</span>
      <span className="text-[11px] text-blue-400">{comp}</span>
      <span className="text-[11px] text-slate-400">)</span>
    </>
  );
}

export default function DayOffViewContents({ order, user, usedVacations }: DayOffViewContentsProps) {
  return (
    <tr className="h-[52px] border-b border-slate-100 last:border-b-0 group hover:bg-slate-50">
      <td className="sticky left-0 z-10 bg-white px-3 group-hover:bg-slate-50 text-[12px] text-slate-400 text-center w-12">
        {order}
      </td>
      <td className="sticky left-[48px] z-10 bg-white px-3 group-hover:bg-slate-50 border-r border-slate-200 text-[13px] font-medium text-slate-800 text-center w-20">
        {user.username}
      </td>
      <td className="px-3 text-[13px] text-slate-500 text-center w-28">
        {user.employment ? dayjs(user.employment.effectiveDate).format('YYYY-MM-DD') : '—'}
      </td>
      <td className="px-3 text-[13px] text-center w-24">
        <DualValue value={user.leaveEntry.totalLeaveDays} comp={user.leaveEntry.totalCompLeaveDays} />
      </td>
      <td className="px-3 text-[13px] text-slate-500 text-center w-24">0</td>
      <td className="px-3 text-[13px] text-center border-r border-slate-200 w-24">
        <DualValue value={user.leaveEntry.totalLeaveDays} comp={user.leaveEntry.totalCompLeaveDays} />
      </td>

      {/* months */}
      {new Array(12).fill(null).map((_, index) => {
        const monthData = usedVacations.find((item) => item.month === index + 1);
        return (
          <td key={`month-${index}`} className="px-3 text-[13px] text-center w-16">
            <DualValue value={monthData?.used ?? 0} comp={monthData?.usedComp ?? 0} />
          </td>
        );
      })}

      {/* 합계 */}
      <td className="px-3 text-[13px] text-center border-l border-slate-200 w-24">
        <DualValue value={user.leaveEntry.usedLeaveDays} comp={user.leaveEntry.usedCompLeaveDays} />
      </td>

      {/* 잔여 */}
      <td className="px-3 text-[13px] text-center w-24">
        <DualValue
          value={user.leaveEntry.totalLeaveDays - user.leaveEntry.usedLeaveDays}
          comp={user.leaveEntry.totalCompLeaveDays - user.leaveEntry.usedCompLeaveDays}
        />
      </td>
    </tr>
  );
}
