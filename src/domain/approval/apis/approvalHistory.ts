import { ApprovalHistory, SearchDocumentApprovalHistoryRequest } from '@/domain/approval/apis/approval.dto';
import api from '@/shared/api';
import { Page } from '@/shared/api/common.dto';

export async function searchApprovalHistories(req: SearchDocumentApprovalHistoryRequest) {
  return api.get('/api/v1/documents/approval', { searchParams: req }).json<Page<ApprovalHistory>>();
}
