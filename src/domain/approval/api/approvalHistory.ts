import api from '@/shared/api';

export async function searchApprovalHistories(req: SearchDocumentApprovalHistoryRequest) {
  return api.get('/api/documents/approval', { searchParams: req }).json<Page<ApprovalHistory>>();
}
