'use client';

import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import { LuFileText, LuPlus, LuSearch } from 'react-icons/lu';

import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { searchApprovalHistories } from '@/domain/approval/apis/approvalHistory';
import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import { useUser } from '@/domain/users/queries/user';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

import { MANAGER_ROLES, NAV_GROUPS } from './nav';
import { canSelectOnEnter, matchesDrafter, matchesLabel, parsePaletteQuery } from './paletteQuery';

const RESULT_SIZE = 5;
// ponytail: 최근 결재 50건 안에서만 기안자 이름을 찾는다. 오래된 문서까지 필요하면 서버에 기안자 이름 필터 추가.
const FETCH_SIZE = 50;

type PaletteItem = {
  id: string;
  section: 'menu' | 'documents';
  href: string;
  icon: ReactNode;
  label: ReactNode;
  trailing?: ReactNode;
};

export default function CommandPalette() {
  // ref
  const inputRef = useRef<HTMLInputElement>(null);

  // state
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  // hooks
  const t = useTranslations('palette');
  const tn = useTranslations('nav');
  const router = useRouter();
  const baseId = useId();

  // query
  const { user } = useUser();
  const { type, nameTokens } = parsePaletteQuery(q);

  // 문서 종류별로만 캐시하고 기안자 이름은 클라이언트에서 거른다 — 이름을 더 입력해도 재요청하지 않는다.
  const { data, isFetching } = useQuery({
    queryKey: ['palette', 'approvals', type ?? 'all'],
    queryFn: () => searchApprovalHistories({ type, page: 0, size: FETCH_SIZE }),
    enabled: open && (!!type || nameTokens.length > 0),
    staleTime: 10_000,
  });

  // useEffect
  useEffect(() => {
    const reset = () => {
      setInput('');
      setQ('');
      setActive(0);
    };
    const handleOpen = () => {
      reset();
      setOpen(true);
    };
    // 열린 팔레트에서 ⌘K 를 누르면 하나 더 열지 않고 닫는다.
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        reset();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('open-command-palette', handleOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-command-palette', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // daisyUI modal 은 `modal-open` 이후에 보이므로 autoFocus 대신 여기서 포커스한다.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previous?.focus();
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => setQ(input.trim()), 250);
    return () => clearTimeout(timer);
  }, [input]);

  // handle
  const isManager = MANAGER_ROLES.includes(user?.role.type || 'ROLE_USER');

  const menuItems: PaletteItem[] = NAV_GROUPS.filter((group) => !group.manager || isManager)
    .flatMap((group) => group.items)
    .filter((item) => matchesLabel(tn(item.key), q))
    .map((item) => {
      const Icon = item.icon ?? LuPlus;
      return {
        id: `m-${item.key}`,
        section: 'menu',
        href: item.href,
        icon: <Icon className="size-4" />,
        label: tn(item.key),
      };
    });

  const documentItems: PaletteItem[] =
    data && (type || nameTokens.length)
      ? data.content
          .filter((history) => matchesDrafter(history.document.user?.username, nameTokens))
          .slice(0, RESULT_SIZE)
          .map((history) => ({
            id: `d-${history.id}`,
            section: 'documents',
            href: `/approvals/${history.id}`,
            icon: <LuFileText className="size-4" />,
            label: [
              tn(history.document.type === 'VACATION' ? 'dayoffRequest' : 'overtimeRequest'),
              history.document.user?.username,
              dayjs(history.document.createdDate).format('YYYY-MM-DD'),
            ]
              .filter(Boolean)
              .join(' · '),
            trailing: <DocumentStatusBadge status={history.document.status} />,
          }))
      : [];

  const items = [...menuItems, ...documentItems];
  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));
  const optionId = (i: number) => `${baseId}-opt-${i}`;
  const listId = `${baseId}-list`;

  const handleClose = () => setOpen(false);

  const handleSelect = (item?: PaletteItem) => {
    if (!item) return;
    router.push(item.href);
    setOpen(false);
  };

  const handleChange = (value: string) => {
    setInput(value);
    setActive(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && items.length) {
      e.preventDefault();
      setActive((activeIndex + 1) % items.length);
    } else if (e.key === 'ArrowUp' && items.length) {
      e.preventDefault();
      setActive((activeIndex - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const { isComposing, keyCode } = e.nativeEvent;

      if (canSelectOnEnter({ isComposing, keyCode, input, q })) {
        handleSelect(items[activeIndex]);
      } else {
        // 조합/debounce 가 끝난 결과로 다시 Enter 를 누르게 한다.
        setQ(input.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  const renderSection = (section: PaletteItem['section']) => {
    const sectionItems = items.filter((item) => item.section === section);
    if (!sectionItems.length) return null;
    const headingId = `${baseId}-${section}`;
    return (
      <div role="group" aria-labelledby={headingId}>
        <div id={headingId} className="text-base-content/50 px-2 pt-1.5 pb-0.5 text-[10px]">
          {t(section)}
        </div>
        {sectionItems.map((item) => {
          const index = items.indexOf(item);
          const selected = index === activeIndex;
          return (
            <div
              key={item.id}
              id={optionId(index)}
              role="option"
              aria-selected={selected}
              className={cx(
                'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm',
                selected && 'bg-primary/10 text-accent font-semibold',
              )}
              onMouseMove={() => setActive(index)}
              onClick={() => handleSelect(item)}
            >
              {item.icon}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.trailing}
              {selected && <kbd className="kbd kbd-xs">↵</kbd>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
      className={cx('modal modal-top', open && 'modal-open')}
      onKeyDown={handleKeyDown}
    >
      <div className="modal-box mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-lg rounded-xl p-2">
        <div className="border-base-200 flex items-center gap-2 border-b px-2 pb-2">
          <LuSearch className="size-4 opacity-50" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && items.length ? optionId(activeIndex) : undefined}
            aria-label={t('placeholder')}
            placeholder={t('placeholder')}
            value={input}
            className="flex-1 bg-transparent text-sm outline-none"
            onChange={(e) => handleChange(e.target.value)}
          />
          {isFetching && <span className="loading loading-spinner loading-xs" aria-label={t('loading')} />}
          <kbd className="kbd kbd-xs">esc</kbd>
        </div>

        <div id={listId} role="listbox" aria-label={t('title')} className="max-h-[50vh] overflow-y-auto py-1">
          {renderSection('menu')}
          {renderSection('documents')}
          {q && !items.length && !isFetching && (
            <div className="text-base-content/50 px-2 py-3 text-center text-sm">{t('empty')}</div>
          )}
        </div>

        <div className="border-base-200 text-base-content/50 mt-1 flex gap-2.5 border-t px-2 pt-2 text-[10px]">
          <span>
            <kbd className="kbd kbd-xs">↑↓</kbd> {t('move')}
          </span>
          <span>
            <kbd className="kbd kbd-xs">↵</kbd> {t('open')}
          </span>
          <span className="ml-auto">{t('hint')}</span>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose} />
    </div>
  );
}
