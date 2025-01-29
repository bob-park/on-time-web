'use client';

import { useEffect, useState } from 'react';

import { getDaysOfWeek } from '@/utils/parse';

import { useGenerateCurrentCheck, useGetCurrentCheck } from '@/domain/attendance/query/attendanceCheck';
import cx from 'classnames';
import dayjs from 'dayjs';
import QRCode from 'qrcode';

const QR_CANVAS_ID = 'qr_canvas';

export default function QRContents() {
  // state
  const [selectType, setSelectType] = useState<AttendanceType>('CLOCK_IN');

  // query
  const { currentCheck } = useGetCurrentCheck();
  const { generateCheck, isLoading } = useGenerateCurrentCheck();

  // useEffect
  useEffect(() => {
    generateCheck({ type: 'QR', attendanceType: selectType });
  }, [selectType]);

  useEffect(() => {
    if (!currentCheck) {
      return;
    }

    async function createQRCode() {
      if (!currentCheck) {
        return;
      }

      const canvas = document.getElementById(QR_CANVAS_ID) as HTMLCanvasElement;

      if (!canvas) {
        return;
      }

      console.log(`${location.origin}/attendance/record/${currentCheck.id}`);

      await QRCode.toCanvas(canvas, `${location.origin}/attendance/record/${currentCheck.id}`, {
        width: 400,
      });
    }

    createQRCode();

    const intervalId = setInterval(() => {
      if (dayjs(currentCheck.expiredDate).isBefore(dayjs())) {
        generateCheck({ type: 'QR', attendanceType: selectType });
      }
    }, 1_000);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentCheck, selectType]);

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

      {isLoading && (
        <div className="mt-10 flex h-56 flex-col items-center justify-center gap-3">
          <span className="loading loading-infinity loading-lg"></span>
        </div>
      )}

      {/* QR Code */}
      {!isLoading && currentCheck && (
        <div className="mt-10 flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col items-center justify-start gap-1">
            <div className="flex items-center justify-start gap-3">
              <div className="flex-none text-right">근무일 : </div>
              <div className="text-left">
                <span>{dayjs(currentCheck.workingDate).format('YYYY년 MM월 DD일')}</span>
                <span className="ml-1">({getDaysOfWeek(dayjs(currentCheck.workingDate).day())})</span>
              </div>
            </div>
            <div className="flex items-center justify-start gap-3">
              <div className="flex-none text-right">생성일 : </div>
              <div className="text-left">{dayjs(currentCheck.createdDate).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
            <div className="flex items-center justify-start gap-3">
              <div className="flex-none text-right">만료일 : </div>
              <div className="text-left">{dayjs(currentCheck.expiredDate).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
          </div>

          <canvas id={QR_CANVAS_ID} className="mt-5 w-full" />
        </div>
      )}
    </div>
  );
}
