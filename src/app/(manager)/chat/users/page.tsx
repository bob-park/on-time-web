import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import ChatUsersContents from './_components/ChatUsersContents';

export default async function ChatUsersPage() {
  const t = await getTranslations('chat');

  return (
    <div className="animate-fade-up flex size-full flex-col gap-4">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      {/* people list */}
      <ChatUsersContents />
    </div>
  );
}
