'use client';

import { UsedVacation, User } from '@/domain/users/apis/users.dto';

import cx from 'classnames';
import dayjs from 'dayjs';

interface DayOffViewContentsProps {
  order: number;
  user: User;
  usedVacations: UsedVacation[];
}

// 본값(연차) 기본색 / 괄호 보상값 muted, 둘 다 0 이면 "—" muted
function DualValue({ value, comp, valueClassName }: { value: number; comp: number; valueClassName?: string }) {
  if (value === 0 && comp === 0) {
    return <span className="text-3">—</span>;
  }
  return (
    <>
      <span className={cx('text-base-content', valueClassName)}>{value}</span>
      {comp > 0 && <span className="text-2 ml-0.5 text-xs">({comp})</span>}
    </>
  );
}

const cellClass = 'px-3 py-3 text-center whitespace-nowrap';

export default function DayOffViewContents({ order, user, usedVacations }: DayOffViewContentsProps) {
  const remaining = (user.leaveEntry?.totalLeaveDays ?? 0) - (user.leaveEntry?.usedLeaveDays ?? 0);
  const remainingComp = (user.leaveEntry?.totalCompLeaveDays ?? 0) - (user.leaveEntry?.usedCompLeaveDays ?? 0);

  return (
    <tr className="group border-soft hover:bg-base-200 border-b transition-colors duration-100 last:border-b-0">
      {/* 순번 (sticky) */}
      <td className="bg-base-100 text-3 group-hover:bg-base-200 sticky left-0 z-10 px-3 py-3 text-center whitespace-nowrap">
        {order}
      </td>

      {/* 성명 (sticky) */}
      <td className="bg-base-100 border-soft group-hover:bg-base-200 sticky left-[48px] z-10 border-r px-3 py-3 whitespace-nowrap">
        <div className="font-bold">{user.username}</div>
        {user.groups?.[0]?.group.name && <div className="text-3 mt-0.5 text-xs">{user.groups?.[0]?.group.name}</div>}
      </td>

      {/* 입사일 */}
      <td className="text-3 px-3 py-3 text-center whitespace-nowrap">
        {user.employment ? dayjs(user.employment.effectiveDate).format('YYYY.MM.DD') : '—'}
      </td>

      {/* 연차(보상) */}
      <td className={cellClass}>
        <DualValue value={user.leaveEntry?.totalLeaveDays ?? 0} comp={user.leaveEntry?.totalCompLeaveDays ?? 0} />
      </td>

      {/* 사용가능 */}
      <td className={cx(cellClass, 'border-soft border-r')}>
        <DualValue value={user.leaveEntry?.totalLeaveDays ?? 0} comp={user.leaveEntry?.totalCompLeaveDays ?? 0} />
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
      <td className={cx(cellClass, 'border-soft border-l')}>
        <DualValue
          value={user.leaveEntry?.usedLeaveDays ?? 0}
          comp={user.leaveEntry?.usedCompLeaveDays ?? 0}
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
