import Preparing from '@/app/_components/Preparing';

import { getTranslations } from 'next-intl/server';

export default async function DayOffUserCompensatoryPage() {
  const t = await getTranslations('preparing');

  return (
    <div className="flex size-full flex-col items-center justify-center gap-2">
      <Preparing description={t('descriptionCompensatory')} backHref="/dashboard" backLabel={t('backToDashboard')} />
    </div>
  );
}
