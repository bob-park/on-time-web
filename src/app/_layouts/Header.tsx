'use client';

import { useSelectedLayoutSegments } from 'next/navigation';

import UserMenu from '@/app/_layouts/UserMenu';
import { useBreadcrumbTitleValue } from '@/app/_layouts/breadcrumb';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

import { findNavItem } from './nav';

interface HeaderProps {
  theme: Theme;
}

export default function Header({ theme }: HeaderProps) {
  // segments
  const segments = useSelectedLayoutSegments();

  // i18n
  const t = useTranslations('nav');

  // 상세 페이지가 걸어둔 문서 제목
  const detailTitle = useBreadcrumbTitleValue();

  const { group, item } = findNavItem(segments);

  return (
    <header className="flex h-11 w-full flex-none items-center gap-3 px-4 md:h-10 md:px-7">
      {/* breadcrumb */}
      <div className="text-3 flex min-w-0 items-center gap-1.5 text-[13px]">
        {group?.key && (
          <>
            <span>{t(group.key)}</span>
            <span>›</span>
          </>
        )}
        {item && <span className={cx({ 'text-base-content font-semibold': !detailTitle })}>{t(item.key)}</span>}
        {detailTitle && (
          <>
            {item && <span>›</span>}
            <span className="text-base-content truncate font-semibold">{detailTitle}</span>
          </>
        )}
      </div>

      <span className="flex-1" />

      {/* 모바일에는 사이드바가 없으므로 사용자 메뉴를 여기서 연다 */}
      <div className="md:hidden">
        <UserMenu theme={theme} placement="bottom-end" />
      </div>
    </header>
  );
}
