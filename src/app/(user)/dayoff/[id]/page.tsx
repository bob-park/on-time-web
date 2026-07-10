import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import DayOffDetailContents from './_components/DayOffDetailContents';

export default async function DayOffDetailPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;
  const t = await getTranslations('approval.detail');

  return (
    <div className="animate-fade-up flex size-full flex-col items-center gap-4">
      {/* eyebrow + title */}
      <div className="w-full max-w-[1200px]">
        <PageHeader eyebrow={t('eyebrow')} title={t('dayoffTitle')} />
      </div>

      {/* contents */}
      <div className="w-full max-w-[1200px]">
        <DayOffDetailContents id={id} />
      </div>
    </div>
  );
}
