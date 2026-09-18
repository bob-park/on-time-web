import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import DayOffManageContents from './_components/DayOffManageContents';

export default async function DayoffManagePage() {
  const t = await getTranslations('manager.vacations');

  return (
    <div className="flex size-full flex-col">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} />

      <div className="w-full max-w-[1500px]">
        <DayOffManageContents />
      </div>
    </div>
  );
}
