'use client';

import { useState } from 'react';

import cx from 'classnames';

export default function QRContents() {
  // state
  const [selectType, setSelectType] = useState<AttendanceType>('CLOCK_IN');

  // handle
  const handleChangeSelectType = (type: AttendanceType) => {
    setSelectType(type);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {/* 출퇴근 버튼 */}
      <div className="flex w-full flex-row items-center justify-center gap-3">
        <button
          className={cx('btn btn-lg', { 'btn-primary': selectType === 'CLOCK_IN' })}
          onClick={() => handleChangeSelectType('CLOCK_IN')}
        >
          출근
        </button>
        <button
          className={cx('btn btn-lg', { 'btn-neutral': selectType === 'CLOCK_OUT' })}
          onClick={() => handleChangeSelectType('CLOCK_OUT')}
        >
          퇴근
        </button>
      </div>
    </div>
  );
}
