import { ApprovalHistory } from '@/domain/approval/apis/approval.dto';
import { Document, RejectDocumentRequest, SearchDocumentRequest } from '@/domain/document/apis/document.dto';
import api from '@/shared/api';
import { Page } from '@/shared/api/common.dto';
import delay from '@/utils/delay';

export async function searchDocument(req: SearchDocumentRequest) {
  const result = await api.get(`/api/v1/documents`, { searchParams: req }).json<Page<Document>>();

  return result;
}

export async function getApprovalHistory(id: number) {
  return api.get(`/api/v1/documents/approval/${id}`).json<ApprovalHistory>();
}

export async function approveDocument(id: number) {
  const result = await api.post(`/api/v1/documents/approval/${id}`).json<ApprovalHistory>();

  await delay(1_000);

  return result;
}

export async function rejectDocument(id: number, req: RejectDocumentRequest) {
  const result = await api.post(`/api/v1/documents/approval/${id}/reject`, { json: req }).json<ApprovalHistory>();

  await delay(1_000);

  return result;
}

export async function requestDocument(id: number) {
  const result = await api.post(`/api/v1/documents/${id}/request`).json<Document>();

  await delay(1_000);

  return result;
}

export async function cancelDocument(id: number) {
  await api.delete(`/api/v1/documents/${id}/cancel`);

  await delay(1_000);
}
