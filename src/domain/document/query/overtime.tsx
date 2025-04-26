import { createOverTimeWorkDocument, getOverTimeWorkDocument } from '@/domain/document/api/overtime';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCreateOverTimeWorkDocument(onSuccess?: () => void, onError?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['documents', 'overtimes', 'create'],
    mutationFn: (req: CreateOverTimeWorkDocumentRequest) => createOverTimeWorkDocument(req),
    onSuccess: (data) => {
      queryClient.setQueryData(['documents', 'overtimes'], data);

      onSuccess && onSuccess();
    },
    onError: () => {
      onError && onError();
    },
  });

  return { createOverTimeWork: mutate, isLoading: isPending };
}

export function useOverTimeWorkDocuments(id: number) {
  const { data, isLoading } = useQuery<OverTimeWorkDocument>({
    queryKey: ['documents', 'overtimes', id],
    queryFn: () => getOverTimeWorkDocument(id),
  });

  return { overTimeWorkDocument: data, isLoading };
}
