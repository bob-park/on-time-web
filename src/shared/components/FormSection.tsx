import cx from 'classnames';

interface FormSectionProps {
  step: number;
  title: string;
  description?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

// 신청 폼의 번호가 붙은 단계 섹션 — 휴가 신청 / 휴일 근무 보고에서 공유
export default function FormSection({ step, title, description, error, className, children }: FormSectionProps) {
  return (
    <section className={cx('border-soft border-b px-[22px] py-5 last:border-b-0', className)}>
      <h3 className="flex flex-wrap items-center gap-2.5 text-[15px] font-semibold">
        <span className="bg-primary text-primary-content inline-flex size-[22px] flex-none items-center justify-center rounded-full text-xs">
          {step}
        </span>
        {title}
        {error && <span className="text-error text-xs font-medium">{error}</span>}
      </h3>
      {description && <p className="text-2 mt-1 text-[13px]">{description}</p>}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}
