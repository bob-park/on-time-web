'use client';

import { useEffect, useRef, useState } from 'react';

import { getDaysOfWeek } from '@/utils/parse';

import { useGenerateCurrentCheck, useGetCurrentCheck } from '@/domain/attendance/query/attendanceCheck';
import cx from 'classnames';
import dayjs from 'dayjs';
import QRCodeStyling, { Options } from 'qr-code-styling';

const QR_CANVAS_ID = 'qr_canvas';

export default function QRContents() {
  // ref
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // state
  const [selectType, setSelectType] = useState<AttendanceType>('CLOCK_IN');

  const [qrOptions, setQrOptions] = useState<Options>({
    width: 300,
    height: 300,
    image: '/malgn_logo.png',
    dotsOptions: {
      color: '#4267b2',
      type: 'rounded',
    },
    imageOptions: {
      crossOrigin: 'anonymous',
    },
  });
  const [qrCode, setQrCode] = useState<QRCodeStyling>();

  // query
  const { currentCheck } = useGetCurrentCheck();
  const { generateCheck, isLoading } = useGenerateCurrentCheck();

  // useEffect
  useEffect(() => {
    generateCheck({ type: 'QR', attendanceType: selectType });

    setQrCode(new QRCodeStyling(qrOptions));
  }, []);

  useEffect(() => {
    if (!currentCheck) {
      return;
    }

    const url = `${location.origin}/attendance/record/${currentCheck?.id}`;
    console.log(url);

    setQrOptions({
      ...qrOptions,
      data: url,
    });
  }, [currentCheck]);

  useEffect(() => {
    generateCheck({ type: 'QR', attendanceType: selectType });
  }, [selectType]);

  useEffect(() => {
    if (!qrCanvasRef.current) {
      return;
    }

    qrCode?.append(qrCanvasRef.current);
  }, [qrCode]);

  useEffect(() => {
    qrCode?.update(qrOptions);
  }, [qrCode, qrOptions]);

  useEffect(() => {
    if (!currentCheck) {
      return;
    }

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

      <div className="mt-10 flex flex-col items-center justify-center gap-3">
        <div className="flex flex-col items-center justify-start gap-1">
          {!isLoading && currentCheck && (
            <>
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
            </>
          )}
        </div>
        <div id={QR_CANVAS_ID} ref={qrCanvasRef} className={cx(isLoading && 'invisible')} />
      </div>
    </div>
  );
}
