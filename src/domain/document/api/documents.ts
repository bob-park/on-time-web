import api from '@/shared/api';

import delay from '@/utils/delay';

export async function searchDocument(req: SearchDocumentRequest) {
  const result = await api.get(`/api/documents`, { searchParams: req }).json<Page<Document>>();

  return result;
}

export async function getApprovalHistory(id: number) {
  return api.get(`/api/documents/approval/${id}`).json<ApprovalHistory>();
}

export async function approveDocument(id: number) {
  const result = await api.post(`/api/documents/approval/${id}`).json<ApprovalHistory>();

  await delay(1_000);

  return result;
}

export async function rejectDocument(id: number, req: RejectDocumentRequest) {
  const result = await api.post(`/api/documents/approval/${id}/reject`, { json: req }).json<ApprovalHistory>();

  await delay(1_000);

  return result;
}
