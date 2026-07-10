import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import PersonalInfoContents from './_components/PersonalInfoContents';
import UpdatePasswordContents from './_components/UpdatePasswordContents';
import UpdateUserSignatureContents from './_components/UpdateUserSignatureContents';

export default async function ProfilePage() {
  const t = await getTranslations('profile');

  return (
    <div className="w-full">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} />

      {/* contents */}
      <div className="flex max-w-[900px] flex-col gap-4">
        <PersonalInfoContents />
        <UpdatePasswordContents />
        <UpdateUserSignatureContents />
      </div>
    </div>
  );
}
