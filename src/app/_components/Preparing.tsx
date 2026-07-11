import Link from 'next/link';

import { getTranslations } from 'next-intl/server';

interface PreparingProps {
  description: string;
  backHref: string;
  backLabel: string;
}

export default async function Preparing({ description, backHref, backLabel }: PreparingProps) {
  const t = await getTranslations('preparing');

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 pb-10 text-center select-none">
      <span className="relative flex h-2.5 w-2.5">
        <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"></span>
        <span className="bg-primary relative inline-flex h-2.5 w-2.5 rounded-full"></span>
      </span>

      <h2 className="text-[72px] leading-none font-bold tracking-tight">{t('title')}</h2>

      <p className="text-base-content/60 max-w-[420px] text-[15px] leading-relaxed">{description}</p>

      <Link className="btn btn-outline" href={backHref}>
        {backLabel}
      </Link>
    </div>
  );
}
