'use client';

import { useEffect, useRef, useState } from 'react';

import { AttendanceType } from '@/domain/attendance/apis/attendance.dto';
import { useGenerateCurrentCheck, useGetCurrentCheck } from '@/domain/attendance/queries/attendanceCheck';
import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import type { Options } from 'qr-code-styling';

const QR_CANVAS_ID = 'qr_canvas';

export default function QRContents() {
  // i18n
  const t = useTranslations('manager.qr');

  // ref
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // state
  const [selectType, setSelectType] = useState<AttendanceType>('CLOCK_IN');

  const [qrOptions, setQrOptions] = useState<Options>({
    width: 300,
    height: 300,
    image: '/malgn_logo.png',
    dotsOptions: {
      // QR 은 스캔 대비를 위해 흰 패널 + 고정 다크 도트 (테마 무관)
      color: '#101114',
      type: 'rounded',
    },
    imageOptions: {
      crossOrigin: 'anonymous',
    },
  });
  const [qrCode, setQrCode] = useState<InstanceType<typeof import('qr-code-styling').default>>();

  // query
  const { currentCheck } = useGetCurrentCheck();
  const { generateCheck, isLoading } = useGenerateCurrentCheck();

  // useEffect
  useEffect(() => {
    generateCheck({ type: 'QR', attendanceType: selectType });

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      setQrCode(new QRCodeStyling(qrOptions));
    });
  }, []);

  useEffect(() => {
    if (!currentCheck) {
      return;
    }

    const url = `${location.origin}/attendance/record/${currentCheck?.id}`;

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

  const typeLabel = selectType === 'CLOCK_IN' ? t('clockIn') : t('clockOut');

  return (
    <div className="flex w-full flex-col items-center gap-6 pt-2">
      {/* 출퇴근 토글 */}
      <div className="inline-flex gap-3">
        <button
          className={cx('btn btn-lg', selectType === 'CLOCK_IN' ? 'btn-primary' : 'btn-outline')}
          onClick={() => handleChangeSelectType('CLOCK_IN')}
        >
          {t('clockIn')}
        </button>
        <button
          className={cx('btn btn-lg', selectType === 'CLOCK_OUT' ? 'btn-primary' : 'btn-outline')}
          onClick={() => handleChangeSelectType('CLOCK_OUT')}
        >
          {t('clockOut')}
        </button>
      </div>

      {/* 정보 카드 + QR */}
      <div className="bg-base-100 border-base-300 rounded-box shadow-whisper w-full max-w-[420px] border p-5">
        {/* 메타 정보 */}
        {!isLoading && currentCheck && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between py-2 text-[13.5px]">
              <span className="text-2">{t('workingDate')}</span>
              <span className="font-bold">
                {dayjs(currentCheck.workingDate).format('YYYY년 MM월 DD일')} (
                {getDaysOfWeek(dayjs(currentCheck.workingDate).day())})
              </span>
            </div>
            <div className="flex items-center justify-between py-2 text-[13.5px]">
              <span className="text-2">{t('createdDate')}</span>
              <span className="font-bold">{dayjs(currentCheck.createdDate).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-2 text-[13.5px]">
              <span className="text-2">{t('expiredDate')}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold">{dayjs(currentCheck.expiredDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                <span className="text-primary inline-flex items-center gap-1.5 text-xs font-bold">
                  <span className="bg-primary inline-block size-2 animate-pulse rounded-full"></span>
                  {t('autoRefresh')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 로딩 */}
        {isLoading && (
          <div className="flex h-16 flex-col items-center justify-center">
            <span className="loading loading-infinity loading-lg text-primary"></span>
          </div>
        )}

        {/* QR 흰 패널 (스캔 대비 필수) — 캔버스는 항상 마운트 유지 */}
        <div className={cx('mt-4 flex justify-center rounded-xl bg-white p-5', isLoading && 'invisible')}>
          <div id={QR_CANVAS_ID} ref={qrCanvasRef} role="img" aria-label={t('qrAlt', { type: typeLabel })} />
        </div>

        {/* 캡션 */}
        {!isLoading && currentCheck && (
          <p className="text-2 mt-3.5 text-center text-xs">{t('caption', { type: typeLabel })}</p>
        )}
      </div>
    </div>
  );
}
