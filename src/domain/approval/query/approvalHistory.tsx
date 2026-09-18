import { useQuery } from '@tanstack/react-query';

import { searchApprovalHistories } from '@/domain/approval/api/approvalHistory';
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
