import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import AttendanceRecordGpsContents from './_components/AttendanceRecordGpsContents';

export default async function AttendanceRecordGpsPage() {
  const t = await getTranslations('attendance.record.gps');

  return (
    <div className="w-full">
      {/* eyebrow + title */}
      <PageHeader title={t('title')} description={t('subtitle')} />

      {/* content */}
      <AttendanceRecordGpsContents />
    </div>
  );
}
