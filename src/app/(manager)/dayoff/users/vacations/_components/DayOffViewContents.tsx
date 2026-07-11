'use client';

import cx from 'classnames';
import dayjs from 'dayjs';

interface DayOffViewContentsProps {
  order: number;
  user: User;
  usedVacations: UsedVacation[];
}

// 본값(연차) white / 괄호 보상값 warning, 둘 다 0 이면 "—" muted
function DualValue({ value, comp, valueClassName }: { value: number; comp: number; valueClassName?: string }) {
  if (value === 0 && comp === 0) {
    return <span className="text-base-content/30">—</span>;
  }
  return (
    <>
      <span className={cx('text-base-content', valueClassName)}>{value}</span>
      {comp > 0 && <span className="text-warning ml-0.5 text-xs">({comp})</span>}
    </>
  );
}

const cellClass = 'px-3 py-3 text-center whitespace-nowrap';

export default function DayOffViewContents({ order, user, usedVacations }: DayOffViewContentsProps) {
  const remaining = user.leaveEntry.totalLeaveDays - user.leaveEntry.usedLeaveDays;
  const remainingComp = user.leaveEntry.totalCompLeaveDays - user.leaveEntry.usedCompLeaveDays;

  return (
    <tr className="group border-base-content/[0.06] hover:bg-base-content/[0.04] border-b transition-colors duration-100 last:border-b-0">
      {/* 순번 (sticky) */}
      <td className="bg-base-300 text-base-content/40 sticky left-0 z-10 px-3 py-3 text-center whitespace-nowrap group-hover:bg-[#232323]">
        {order}
      </td>

      {/* 성명 (sticky) */}
      <td className="bg-base-300 border-base-content/[0.08] sticky left-[48px] z-10 border-r px-3 py-3 whitespace-nowrap group-hover:bg-[#232323]">
        <div className="font-bold">{user.username}</div>
        {user.group?.name && <div className="text-base-content/50 mt-0.5 text-xs">{user.group.name}</div>}
      </td>

      {/* 입사일 */}
      <td className="text-base-content/50 px-3 py-3 text-center whitespace-nowrap">
        {user.employment ? dayjs(user.employment.effectiveDate).format('YYYY.MM.DD') : '—'}
      </td>

      {/* 연차(보상) */}
      <td className={cellClass}>
        <DualValue value={user.leaveEntry.totalLeaveDays} comp={user.leaveEntry.totalCompLeaveDays} />
      </td>

      {/* 사용가능 */}
      <td className={cx(cellClass, 'border-base-content/[0.08] border-r')}>
        <DualValue value={user.leaveEntry.totalLeaveDays} comp={user.leaveEntry.totalCompLeaveDays} />
      </td>

      {/* 월별 */}
      {Array.from({ length: 12 }).map((_, index) => {
        const monthData = usedVacations.find((item) => item.month === index + 1);
        return (
          <td key={`month-${index}`} className={cellClass}>
            <DualValue value={monthData?.used ?? 0} comp={monthData?.usedComp ?? 0} />
          </td>
        );
      })}

      {/* 합계 */}
      <td className={cx(cellClass, 'border-base-content/[0.08] border-l')}>
        <DualValue
          value={user.leaveEntry.usedLeaveDays}
          comp={user.leaveEntry.usedCompLeaveDays}
          valueClassName="font-bold"
        />
      </td>

      {/* 잔여 */}
      <td className={cellClass}>
        <DualValue value={remaining} comp={remainingComp} valueClassName="text-primary font-bold" />
      </td>
    </tr>
  );
}
