'use client';

import { Document, OverTimeWorkDocument, VacationDocument } from '@/domain/document/apis/document.dto';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

// 문서 한 줄 요약 — 휴가는 사유, 휴일 근무는 첫 근무 내용
export function documentSummary(doc: Document): string | undefined {
  return doc.type === 'VACATION'
    ? (doc as VacationDocument).reason
    : (doc as OverTimeWorkDocument).workTimes?.[0]?.contents;
}

// 기간/일수 — 휴가는 시작–종료일, 휴일 근무는 근무 건수
export default function DocumentPeriod({ doc }: { doc: Document }) {
  const t = useTranslations('common');

  if (doc.type === 'VACATION') {
    const { startDate, endDate } = doc as VacationDocument;

    if (!startDate) {
      return <>—</>;
    }

    return (
      <>
        {dayjs(startDate).isSame(endDate, 'day')
          ? dayjs(startDate).format('MM/DD')
          : `${dayjs(startDate).format('MM/DD')} – ${dayjs(endDate).format('MM/DD')}`}
      </>
    );
  }

  const times = (doc as OverTimeWorkDocument).workTimes;

  return <>{times?.length ? t('timesCount', { count: times.length }) : '—'}</>;
}
