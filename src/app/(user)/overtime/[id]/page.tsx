import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import OvertimeWorkDocumentContents from './_components/OvertimeWorkDocumentContents';

export default async function OvertimeWorkDocumentPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;
  const t = await getTranslations('approval.detail');

  return (
    <div className="animate-fade-up flex size-full flex-col items-center gap-4">
      {/* eyebrow + title */}
      <div className="w-full max-w-[1200px]">
        <PageHeader eyebrow={t('eyebrow')} title={t('overtimeTitle')} />
      </div>

      {/* contents */}
      <div className="w-full max-w-[1200px]">
        <OvertimeWorkDocumentContents id={id} />
      </div>
    </div>
  );
}
