import { DocumentsType } from '@/domain/document/apis/document.dto';
import Badge, { BadgeVariant } from '@/shared/components/Badge';

const VARIANTS: Record<DocumentsType, BadgeVariant> = {
  VACATION: 'primary',
  OVERTIME_WORK: 'wait',
};

const LABELS: Record<DocumentsType, string> = {
  VACATION: '휴가계',
  OVERTIME_WORK: '휴일 근무 보고서',
};

export default function DocumentsTypeBadge({ type }: { type: DocumentsType }) {
  return <Badge variant={VARIANTS[type]}>{LABELS[type]}</Badge>;
}
