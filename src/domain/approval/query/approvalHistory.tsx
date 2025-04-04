import { searchApprovalHistories } from '@/domain/approval/api/approvalHistory';

import { useQuery } from '@tanstack/react-query';

export function useApprovalHistories(req: SearchDocumentApprovalHistoryRequest) {
  const { data, isLoading } = useQuery<Page<ApprovalHistory>>({
    queryKey: ['documents', 'approval', 'histories', req],
    queryFn: () => searchApprovalHistories(req),
  });

  return {
    page: data || {
      content: [],
      total: 0,
      pageable: {
        pageNumber: 0,
        pageSize: 25,
      },
    },
    isLoading,
  };
}
