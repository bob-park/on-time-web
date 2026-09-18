import { Card, CardSection } from '@/shared/components/Card';
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
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 개인 정보 */}
        <Card className="animate-fade-up">
          <CardSection title={t('personalInfo.title')} />
          <div className="p-[18px]">
            <PersonalInfoContents />
          </div>
        </Card>

        {/* 서명 · 패스워드 */}
        <Card className="animate-fade-up">
          <CardSection title={t('signature.title')} />
          <div className="p-[18px]">
            <UpdateUserSignatureContents />
          </div>

          <div className="border-soft border-t">
            <CardSection title={t('password.title')} />
            <div className="p-[18px]">
              <UpdatePasswordContents />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
