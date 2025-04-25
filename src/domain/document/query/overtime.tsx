import { createOverTimeWorkDocument } from '@/domain/document/api/overtime';

import { useMutation } from '@tanstack/react-query';

export function useCreateOverTimeWorkDocument(onSuccess?: () => void, onError?: () => void) {
  const { mutate, isPending } = useMutation({
    mutationKey: ['documents', 'overtime', 'create'],
    mutationFn: (req: CreateOverTimeWorkDocumentRequest) => createOverTimeWorkDocument(req),
    onSuccess: () => {
      onSuccess && onSuccess();
    },
    onError: () => {
      onError && onError();
    },
  });

  return { createOverTimeWork: mutate, isLoading: isPending };
}
