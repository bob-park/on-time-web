import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import AttendanceRecordContents from './_components/AttendanceRecordContents';

export default async function AttendanceRecordPage({ params }: { params: Promise<{ checkId: string }> }) {
  const checkId = (await params).checkId;
  const t = await getTranslations('attendance.record');

  return (
    <div className="w-full">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} />

      {/* content */}
      <AttendanceRecordContents checkId={checkId} />
    </div>
  );
}
