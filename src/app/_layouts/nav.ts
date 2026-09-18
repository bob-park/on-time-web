import { AiOutlineSchedule } from 'react-icons/ai';
import { FaUsersViewfinder } from 'react-icons/fa6';
import { HiDocumentPlus } from 'react-icons/hi2';
import { IoQrCodeOutline, IoTimeOutline } from 'react-icons/io5';
import { LuHistory } from 'react-icons/lu';
import { MdManageAccounts, MdOutlineInbox } from 'react-icons/md';
import { RiDashboardFill } from 'react-icons/ri';

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
  { items: [{ key: 'home', href: '/dashboard', segments: ['dashboard'], icon: RiDashboardFill }] },
  {
    key: 'groupAttendance',
    items: [
      { key: 'schedule', href: '/schedule', segments: ['schedule'], icon: AiOutlineSchedule },
      {
        key: 'attendanceRecord',
        href: '/attendance/record/gps',
        segments: ['attendance', 'record'],
        icon: IoTimeOutline,
      },
    ],
  },
  {
    key: 'groupApproval',
    header: 'requestGroup',
    items: [
      { key: 'dayoffRequest', href: '/dayoff/requests', segments: ['dayoff', 'requests'], sub: true },
      { key: 'overtimeRequest', href: '/overtime/requests', segments: ['overtime', 'requests'], sub: true },
      { key: 'dayoffUsed', href: '/dayoff/used', segments: ['dayoff', 'used'], icon: LuHistory },
      { key: 'documents', href: '/documents', segments: ['documents'], icon: HiDocumentPlus },
      { key: 'approvals', href: '/approvals', segments: ['approvals'], icon: MdOutlineInbox, badge: 'proceeding' },
    ],
  },
  {
    key: 'groupManage',
    manager: true,
    items: [
      { key: 'managerAttendance', href: '/attendance/view', segments: ['attendance', 'view'], icon: FaUsersViewfinder },
      {
        key: 'managerVacations',
        href: '/dayoff/users/vacations',
        segments: ['dayoff', 'users', 'vacations'],
        icon: MdManageAccounts,
      },
      { key: 'qr', href: '/qr', segments: ['qr'], icon: IoQrCodeOutline },
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
