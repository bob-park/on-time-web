'use client';

import { LuMoon, LuSun } from 'react-icons/lu';

import { setTheme } from '@/app/themeAction';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

const THEMES = [
  { theme: 'light', Icon: LuSun },
  { theme: 'dark', Icon: LuMoon },
] as const satisfies readonly { theme: Theme; Icon: unknown }[];

export default function ThemeSwitcher({ current }: Readonly<{ current: Theme }>) {
  // hooks
  const t = useTranslations('nav.themes');
  const tn = useTranslations('nav');

  // handle
  const handleChange = async (theme: Theme) => {
    await setTheme(theme);
  };

  return (
    <div
      role="radiogroup"
      aria-label={tn('theme')}
      className="bg-base-200 grid grid-cols-2 gap-[3px] rounded-xl p-[3px]"
    >
      {THEMES.map(({ theme, Icon }) => {
        const active = current === theme;

        return (
          <button
            key={theme}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => handleChange(theme)}
            className={cx(
              'flex items-center justify-center gap-1.5 rounded-[10px] py-[7px] text-xs font-semibold transition-colors',
              active ? 'bg-base-100 text-primary shadow' : 'text-base-content/60 hover:text-base-content',
            )}
          >
            <Icon className="size-4" />
            {t(theme)}
          </button>
        );
      })}
    </div>
  );
}
