import { useQuery } from '@tanstack/react-query';

import { ApprovalHistory, SearchDocumentApprovalHistoryRequest } from '@/domain/approval/apis/approval.dto';
import { searchApprovalHistories } from '@/domain/approval/apis/approvalHistory';
import { Page } from '@/shared/api/common.dto';

export function useApprovalHistories(req: SearchDocumentApprovalHistoryRequest) {
  const { data, isLoading } = useQuery<Page<ApprovalHistory>>({
    queryKey: ['documents', 'approval', 'histories', req],
    queryFn: () => searchApprovalHistories(req),
  });

  return {
    page: data,
    isLoading,
  };
}
