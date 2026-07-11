import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import DocumentListContents from './_components/DocumentListContents';

export default async function DocumentListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, type, status } = await searchParams;
  const t = await getTranslations('documents');

  const params: SearchDocumentRequest = {
    page: parseInt(page || '0', 0),
    size: 10,
    type: type as DocumentsType,
    status: status as DocumentStatus,
  };

  return (
    <div className="w-full">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      {/* content */}
      <div className="w-full min-w-[600px]">
        <DocumentListContents params={params} />
      </div>
    </div>
  );
}
