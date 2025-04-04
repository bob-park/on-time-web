import { approveDocument, getApprovalHistory, rejectDocument, searchDocument } from '@/domain/document/api/documents';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useDocuments(req: SearchDocumentRequest) {
  const { data, isLoading } = useQuery<Page<Document>>({
    queryKey: ['documents', req],
    queryFn: () => searchDocument(req),
  });

  return {
    page: data,
    isLoading,
  };
}

export function useApprovalDocument(id: number) {
  const { data, isLoading } = useQuery<ApprovalHistory>({
    queryKey: ['documents', 'approval', id],
    queryFn: () => getApprovalHistory(id),
    staleTime: 60 * 1_000,
    gcTime: 120 * 1_000,
  });

  return { approvalHistory: data, isLoading };
}

export function useApproveDocument(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['documents', 'approve'],
    mutationFn: ({ id }: { id: number }) => approveDocument(id),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['documents', 'approval', data.id + ''] });

      onSuccess && onSuccess();
    },
  });

  return { approve: mutate, isLoading: isPending };
}

export function useRejectDocument(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['documents', 'reject'],
    mutationFn: ({ id, req }: { id: number; req: RejectDocumentRequest }) => rejectDocument(id, req),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['documents', 'approval', data.id + ''] });
      onSuccess && onSuccess();
    },
  });

  return { reject: mutate, isLoading: isPending };
}
