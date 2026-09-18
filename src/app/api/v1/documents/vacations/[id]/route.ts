import { NextRequest } from 'next/server';

import { enrichDocument } from '@/app/api/v1/documents/_lib/enrichDocument';
import { VacationDocument } from '@/domain/document/apis/document.dto';
import { handle, serverApi } from '@/shared/api/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return handle(async (sub) => {
    const document = await serverApi.get(`api/v1/documents/vacations/${id}`).json<VacationDocument>();

    return enrichDocument(document, sub);
  });
}
