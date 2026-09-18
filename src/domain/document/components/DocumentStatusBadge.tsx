import { DocumentStatus } from '@/domain/document/apis/document.dto';
import Badge, { BadgeVariant } from '@/shared/components/Badge';

const VARIANTS: Record<DocumentStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  CANCELLED: 'neutral',
  WAITING: 'wait',
  APPROVED: 'ok',
  REJECTED: 'no',
};

const LABELS: Record<DocumentStatus, string> = {
  DRAFT: '초안',
  WAITING: '결재 진행중',
  APPROVED: '결재 완료',
  REJECTED: '결재 반려',
  CANCELLED: '취소',
};

export default function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
