import { useQuery } from '@tanstack/react-query';

import { ApprovalHistory, SearchDocumentApprovalHistoryRequest } from '@/domain/approval/apis/approval.dto';
import { searchApprovalHistories } from '@/domain/approval/apis/approvalHistory';
import { PagedModel } from '@/shared/api/common.dto';

export function useApprovalHistories(req: SearchDocumentApprovalHistoryRequest) {
  const { data, isLoading } = useQuery<PagedModel<ApprovalHistory>>({
    queryKey: ['documents', 'approval', 'histories', req],
    queryFn: () => searchApprovalHistories(req),
  });

  return {
    page: data,
    isLoading,
  };
}
