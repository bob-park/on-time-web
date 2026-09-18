'use client';

import { Document, OverTimeWorkDocument, VacationDocument } from '@/domain/document/apis/document.dto';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

// 목록 응답은 base Document 로 타이핑되어 있어, 실제 payload 에 하위 타입 필드가 있는지로 좁힌다.
function isVacationDocument(doc: Document): doc is VacationDocument {
  return doc.type === 'VACATION' && 'startDate' in doc && doc.startDate != null;
}

function isOverTimeWorkDocument(doc: Document): doc is OverTimeWorkDocument {
  return doc.type === 'OVERTIME_WORK' && 'workTimes' in doc;
}

// 문서 한 줄 요약 — 휴가는 사유, 휴일 근무는 첫 근무 내용
export function documentSummary(doc: Document): string | undefined {
  if (isVacationDocument(doc)) {
    return doc.reason;
  }

  return isOverTimeWorkDocument(doc) ? doc.workTimes?.[0]?.contents : undefined;
}

// 기간/일수 — 휴가는 시작–종료일 + 사용일수, 휴일 근무는 근무 건수
export default function DocumentPeriod({ doc }: { doc: Document }) {
  const t = useTranslations('common');

  if (isVacationDocument(doc)) {
    const range = dayjs(doc.startDate).isSame(doc.endDate, 'day')
      ? dayjs(doc.startDate).format('YYYY.MM.DD')
      : `${dayjs(doc.startDate).format('YYYY.MM.DD')} – ${dayjs(doc.endDate).format('YYYY.MM.DD')}`;

    return <>{`${range} · ${t('days', { days: doc.usedDays?.toFixed(1) ?? '0.0' })}`}</>;
  }

  if (isOverTimeWorkDocument(doc) && doc.workTimes?.length) {
    return <>{t('timesCount', { count: doc.workTimes.length })}</>;
  }

  return <>—</>;
}
