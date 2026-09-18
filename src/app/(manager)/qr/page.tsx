import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import QRContents from './_components/QRContents';

export default async function QRPage() {
  const t = await getTranslations('manager.qr');

  return (
    <div className="animate-fade-up flex size-full flex-col gap-4">
      {/* eyebrow + title */}
      <PageHeader title={t('title')} />

      {/* contents */}
      <QRContents />
    </div>
  );
}
