import Link from 'next/link';

import cx from 'classnames';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cx('bg-base-100 border-base-300 rounded-box shadow-whisper border', className)}>{children}</div>
  );
}

interface CardSectionProps {
  title: string;
  aside?: React.ReactNode;
  link?: { href: string; label: string };
  children?: React.ReactNode;
}

export function CardSection({ title, aside, link, children }: CardSectionProps) {
  return (
    <div className="border-soft flex flex-wrap items-center gap-2.5 border-b px-[18px] py-4">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {aside}
      <span className="flex-1" />
      {children}
      {link && (
        <Link href={link.href} className="text-primary text-[13px] font-medium">
          {link.label} →
        </Link>
      )}
    </div>
  );
}

export default Card;
