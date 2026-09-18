'use client';

import Link from 'next/link';

import { ApprovalHistory } from '@/domain/approval/apis/approval.dto';
import { useApprovalHistories } from '@/domain/approval/queries/approvalHistory';
import DocumentTypeBadge from '@/domain/document/components/DocumentTypeBadge';
import { useApproveDocument } from '@/domain/document/queries/documents';
import { useProceedingApprovalCount } from '@/domain/users/queries/user';
import { authClient } from '@/shared/auth/auth-client';
import Badge from '@/shared/components/Badge';
import { Card, CardSection } from '@/shared/components/Card';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

// 내가 처리할 결재 상위 3건 — 보기(상세 링크) / 승인(인라인)
export default function ProceedingApprovals() {
  const t = useTranslations('dashboard');

  const { data: session } = authClient.useSession();
  const sub = session?.user.sub;

  const { page } = useApprovalHistories({ userUniqueId: sub, status: 'WAITING', page: 0, size: 3 }, { enabled: !!sub });
  const { count } = useProceedingApprovalCount();
  const { approve, isLoading } = useApproveDocument();

  return (
    <Card className="animate-fade-up delay-225">
      <CardSection
        title={t('sectionProceeding')}
        aside={count > 0 ? <Badge variant="primary">{count}</Badge> : undefined}
        link={{ href: '/approvals', label: t('viewAll') }}
      />

      <div className="p-2">
        {(page?.content ?? [])
          .filter((h): h is ApprovalHistory & { id: number } => h.id != null)
          .map((h) => (
            <div key={h.id} className="hover:bg-base-200 flex items-center gap-3 rounded-[10px] px-2.5 py-3">
              <span className="bg-base-200 border-base-300 text-2 flex size-[34px] flex-none items-center justify-center rounded-full border text-xs font-bold">
                {h.document.user?.username?.[0] ?? '?'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className="truncate">{h.document.user?.username}</span>
                  <span className="flex-none">
                    <DocumentTypeBadge type={h.document.type} />
                  </span>
                </div>
                <div className="text-3 text-xs">{t('requestedAt', { time: dayjs(h.createdDate).fromNow() })}</div>
              </div>
              <Link href={`/approvals/${h.id}`} className="btn btn-ghost btn-sm">
                {t('view')}
              </Link>
              <button
                type="button"
                className="btn btn-subtle btn-sm"
                disabled={isLoading}
                onClick={() => approve({ id: h.id })}
              >
                {t('approve')}
              </button>
            </div>
          ))}

        {page && page.content.length === 0 && (
          <p className="text-3 px-3 py-6 text-center text-sm">{t('emptyProceeding')}</p>
        )}
      </div>
    </Card>
  );
}
