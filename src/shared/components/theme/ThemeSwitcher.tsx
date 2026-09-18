'use client';

import { useTransition } from 'react';

import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';

import { setTheme } from '@/app/themeAction';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { useTranslations } from 'next-intl';

interface ThemeSwitcherProps {
  current: Theme;
}

export default function ThemeSwitcher({ current }: ThemeSwitcherProps) {
  // hooks
  const [isPending, startTransition] = useTransition();

  // i18n
  const t = useTranslations('theme');

  const next: Theme = current === 'dark' ? 'light' : 'dark';

  // handle
  const handleToggle = () => {
    startTransition(async () => {
      await setTheme(next);
    });
  };

  return (
    <button
      type="button"
      aria-label={current === 'dark' ? t('toLight') : t('toDark')}
      disabled={isPending}
      className="bg-base-100 border-base-300 text-2 hover:text-base-content flex size-9 items-center justify-center rounded-full border transition-colors disabled:opacity-60"
      onClick={handleToggle}
    >
      {current === 'dark' ? <IoSunnyOutline className="size-[18px]" /> : <IoMoonOutline className="size-[18px]" />}
    </button>
  );
}
