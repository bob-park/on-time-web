import { notFound } from 'next/navigation';

// 출근 QR 기능 비활성화 — 재활성화 시 아래 주석의 원래 페이지로 되돌린다.
// import PageHeader from '@/shared/components/PageHeader';
// import { getTranslations } from 'next-intl/server';
// import QRContents from './_components/QRContents';

export default function QRPage() {
  notFound();
}
