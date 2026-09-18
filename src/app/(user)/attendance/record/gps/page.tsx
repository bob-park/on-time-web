import { notFound } from 'next/navigation';

// 출퇴근 기록(근태 처리) 기능 비활성화 — 재활성화 시 git 이력의 원래 페이지로 되돌린다.
export default function AttendanceRecordGpsPage() {
  notFound();
}
