import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import AttendanceRecordGpsContents from './_components/AttendanceRecordGpsContents';

export default async function AttendanceRecordGpsPage() {
  const t = await getTranslations('attendance.record.gps');

  return (
    <div className="w-full">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      {/* content */}
      <AttendanceRecordGpsContents />
    </div>
  );
}
