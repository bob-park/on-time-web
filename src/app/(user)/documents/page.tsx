import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import DocumentListContents from './_components/DocumentListContents';

export default async function DocumentListPage() {
  const t = await getTranslations('documents');

  return (
    <div className="w-full">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

      {/* content */}
      <DocumentListContents />
    </div>
  );
}
