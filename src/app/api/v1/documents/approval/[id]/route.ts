import { NextRequest } from 'next/server';

import { getApprovalDetail } from '@/app/api/v1/documents/_lib/enrichDocument';
import { forward, handle } from '@/shared/api/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return handle(() => getApprovalDetail(id));
}

// 승인 (POST /documents/approval/{id}) 은 그대로 gateway 로 전달
export async function POST(req: NextRequest) {
  return forward(req);
}
