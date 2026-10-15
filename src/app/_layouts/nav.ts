import { useSyncExternalStore } from 'react';

import {
  LuCalendar,
  LuClockAlert,
  LuFileText,
  LuHistory,
  LuHouse,
  LuInbox,
  LuPlane,
  LuUserCog,
  LuUsers,
} from 'react-icons/lu';

import type { IconType } from 'react-icons';

export interface NavItem {
  key: string; // i18n key in `nav`
  href: string;
  segments: string[]; // useSelectedLayoutSegments() must include all of these
  icon?: IconType;
  sub?: boolean; // indented child of a group header row
  badge?: 'proceeding'; // show useProceedingApprovalCount()
}

export interface NavGroup {
  key?: string; // i18n key for the group label; undefined = no label
  manager?: boolean; // render only for ROLE_MANAGER / ROLE_ADMIN
  header?: string; // i18n key for a non-link header row (신청하기)
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  { items: [{ key: 'home', href: '/dashboard', segments: ['dashboard'], icon: LuHouse }] },
  {
    key: 'groupAttendance',
    items: [{ key: 'schedule', href: '/schedule', segments: ['schedule'], icon: LuCalendar }],
  },
  {
    key: 'groupApproval',
    header: 'requestGroup',
    items: [
      { key: 'dayoffRequest', href: '/dayoff/requests', segments: ['dayoff', 'requests'], icon: LuPlane, sub: true },
      {
        key: 'overtimeRequest',
        href: '/overtime/requests',
        segments: ['overtime', 'requests'],
        icon: LuClockAlert,
        sub: true,
      },
      { key: 'dayoffUsed', href: '/dayoff/used', segments: ['dayoff', 'used'], icon: LuHistory },
      { key: 'documents', href: '/documents', segments: ['documents'], icon: LuFileText },
      { key: 'approvals', href: '/approvals', segments: ['approvals'], icon: LuInbox, badge: 'proceeding' },
    ],
  },
  {
    key: 'groupManage',
    manager: true,
    items: [
      { key: 'managerAttendance', href: '/attendance/view', segments: ['attendance', 'view'], icon: LuUsers },
      {
        key: 'managerVacations',
        href: '/dayoff/users/vacations',
        segments: ['dayoff', 'users', 'vacations'],
        icon: LuUserCog,
      },
    ],
  },
];

export const MANAGER_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

export function isActive(segments: string[], item: NavItem) {
  return item.segments.every((s) => segments.includes(s));
}

// 현재 라우트 세그먼트에 해당하는 그룹/아이템 (breadcrumb 용). 가장 많은 세그먼트를 맞춘 아이템이 우선.
export function findNavItem(segments: string[]): { group?: NavGroup; item?: NavItem } {
  let best: { group?: NavGroup; item?: NavItem; score: number } = { score: 0 };

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isActive(segments, item) && item.segments.length > best.score) {
        best = { group, item, score: item.segments.length };
      }
    }
  }

  return { group: best.group, item: best.item };
}

// CommandPalette 가 이 이벤트를 듣는다.
export const openCommandPalette = () => window.dispatchEvent(new Event('open-command-palette'));

const noopSubscribe = () => () => {};

// Apple 기기는 ⌘K, 그 외는 Ctrl K. 서버는 ⌘K 로 렌더하고 hydration 후 클라이언트가 보정한다.
export function useShortcutLabel() {
  return useSyncExternalStore(
    noopSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'),
    () => '⌘K',
  );
}
