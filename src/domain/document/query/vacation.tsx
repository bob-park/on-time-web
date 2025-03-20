import { createVacation } from '@/domain/document/api/vacation';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateVacation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['create', 'document', 'vacation'],
    mutationFn: (req: CreateVacationDocumentRequest) => createVacation(req),
    onSuccess: (data) => {
      onSuccess && onSuccess();
    },
  });

  return { createVacation: mutate, isLoading: isPending };
}
