import { AttendanceStatus } from '@/domain/attendance/apis/attendance.dto';
import Badge, { BadgeVariant } from '@/shared/components/Badge';

import { useTranslations } from 'next-intl';

const VARIANTS: Record<AttendanceStatus, BadgeVariant> = {
  SUCCESS: 'ok',
  WAITING: 'wait',
  WARNING: 'no',
};

export default function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const t = useTranslations('attendance.record.status');

  return <Badge variant={VARIANTS[status]}>{t(status)}</Badge>;
}
