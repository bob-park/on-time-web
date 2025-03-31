'use client';

import { IoInformationCircleOutline } from 'react-icons/io5';

import cx from 'classnames';

interface UserLeaveEntryProps {
  year: number;
  totalLeaveDays?: number;
  usedLeaveDays?: number;
  totalCompLeaveDays?: number;
  usedCompLeaveDays?: number;
}

export default function UserLeaveEntry({
  year,
  totalLeaveDays = 0,
  usedLeaveDays = 0,
  totalCompLeaveDays = 0,
  usedCompLeaveDays = 0,
}: UserLeaveEntryProps) {
  const freeLeaveDays = totalLeaveDays - usedLeaveDays;
  const freeCompLeaveDays = totalCompLeaveDays - usedCompLeaveDays;

  return (
    <div className="flex size-full flex-col items-center justify-center gap-2">
      {/* 연차 정보 */}
      <div className="stats shadow">
        <div className="stat w-48">
          <div className="stat-figure text-secondary">
            <div className="tooltip" data-tip="너 짬이 아주 대단하구나?">
              <IoInformationCircleOutline className="size-8" />
            </div>
          </div>
          <div className="stat-title">전체 휴가 개수</div>
          <div
            className={cx('stat-value', {
              'text-red-400': totalLeaveDays === 0,
            })}
          >
            {totalLeaveDays}
          </div>
          <div className="stat-desc">연차 적용</div>
        </div>
        <div className="stat w-48">
          <div className="stat-figure text-secondary">
            <div className="tooltip" data-tip="멀 의심해? 너가 사용한 것임">
              <IoInformationCircleOutline className="size-8" />
            </div>
          </div>
          <div className="stat-title">사용 개수</div>
          <div
            className={cx('stat-value', {
              'text-red-400': usedLeaveDays === totalLeaveDays,
            })}
          >
            {usedLeaveDays}
          </div>
          <div className="stat-desc">Yolo 머 그런건가?</div>
        </div>
        <div className="stat w-48">
          <div className="stat-figure text-secondary">
            <div className="tooltip" data-tip="이야~~">
              <IoInformationCircleOutline className="size-8" />
            </div>
          </div>
          <div className="stat-title">남은 개수</div>
          <div
            className={cx('stat-value', {
              'text-red-400': freeLeaveDays === 0,
              'text-yellow-600': freeLeaveDays > 1 && freeLeaveDays < 5,
            })}
          >
            {freeLeaveDays}
          </div>
          <div className="stat-desc">귀엽네</div>
        </div>
      </div>

      {/* 대체 휴가 정보 */}
      <div className="stats shadow">
        <div className="stat w-48">
          <div className="stat-figure text-secondary">
            <IoInformationCircleOutline className="size-8" />
          </div>
          <div className="stat-title">전체 대체 휴가 개수</div>
          <div
            className={cx('stat-value', {
              'text-red-400': totalCompLeaveDays === 0,
            })}
          >
            {totalCompLeaveDays}
          </div>
          <div className="stat-desc">휴일 근무 포함</div>
        </div>
        <div className="stat w-48">
          <div className="stat-figure text-secondary">
            <IoInformationCircleOutline className="size-8" />
          </div>
          <div className="stat-title">사용 개수</div>
          <div
            className={cx('stat-value', {
              'text-red-400': usedCompLeaveDays === totalCompLeaveDays,
            })}
          >
            {usedCompLeaveDays}
          </div>
          <div className="stat-desc">아 이게 머지?</div>
        </div>
        <div className="stat w-48">
          <div className="stat-figure text-secondary">
            <IoInformationCircleOutline className="size-8" />
          </div>
          <div className="stat-title">남은 개수</div>
          <div
            className={cx('stat-value', {
              'text-red-400': freeCompLeaveDays === 0,
              'text-yellow-600': freeCompLeaveDays > 1 && freeCompLeaveDays < 5,
            })}
          >
            {freeCompLeaveDays}
          </div>
          <div className="stat-desc">귀엽네</div>
        </div>
      </div>
    </div>
  );
}
