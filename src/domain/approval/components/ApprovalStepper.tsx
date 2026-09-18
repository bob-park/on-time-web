import { ApprovalHistory } from '@/domain/approval/apis/approval.dto';

import cx from 'classnames';

export interface ApprovalStep {
  id: number;
  name: string;
  role: string;
  status: 'ok' | 'current' | 'pending' | 'rejected';
  caption?: string;
}

interface ApprovalStepperProps {
  steps: ApprovalStep[];
}

export default function ApprovalStepper({ steps }: ApprovalStepperProps) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.id} className="relative flex gap-3 py-3">
          {i < steps.length - 1 && (
            <span
              className="absolute top-11 bottom-[-4px] left-[15px] w-0.5"
              style={{ background: 'var(--border-soft)' }}
            />
          )}
          <span
            className={cx(
              'z-[1] flex size-8 flex-none items-center justify-center rounded-full border-2 text-xs font-bold',
              {
                'border-success text-success-content': step.status === 'ok',
                'border-primary bg-primary text-primary-content': step.status === 'current',
                'border-error bg-error text-error-content': step.status === 'rejected',
                'border-base-300 bg-base-100 text-3': step.status === 'pending',
              },
            )}
            style={
              step.status === 'ok'
                ? { background: 'var(--success-soft)', color: 'var(--success-text)' }
                : step.status === 'current'
                  ? { boxShadow: '0 0 0 4px var(--primary-subtle)' }
                  : undefined
            }
          >
            {step.status === 'ok' ? '✓' : step.status === 'rejected' ? '✕' : i + 1}
          </span>
          <span className="min-w-0">
            {/* 승인자 이름이 없으면(결재선 contents 만 있는 경우) 역할을 제목으로 */}
            <span className="block text-sm font-semibold">{step.name || step.role}</span>
            <span className="text-3 block text-xs">
              {[step.name ? step.role : undefined, step.caption].filter(Boolean).join(' · ')}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

// approvalHistories → stepper steps. 첫 미결(status 없음) 항목이 current.
export function toApprovalSteps(histories: ApprovalHistory[], names: (userUniqueId: string) => string): ApprovalStep[] {
  let currentFound = false;

  return histories.map((h) => {
    let status: ApprovalStep['status'] = 'pending';

    if (h.status === 'APPROVED') status = 'ok';
    else if (h.status === 'REJECTED') status = 'rejected';
    else if (!currentFound) {
      status = 'current';
      currentFound = true;
    }

    return {
      id: h.approvalLine.id,
      name: names(h.approvalLine.userUniqueId),
      role: h.approvalLine.contents,
      status,
      caption: h.status === 'REJECTED' ? h.reason : undefined,
    };
  });
}
