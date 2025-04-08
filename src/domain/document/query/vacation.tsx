import { createVacation, getVacationDocument } from '@/domain/document/api/vacation';

import { useMutation, useQuery } from '@tanstack/react-query';

export function useCreateVacation(onSuccess?: (data: VacationDocument) => void, onError?: () => void) {
  const { mutate, isPending } = useMutation({
    mutationKey: ['create', 'document', 'vacation'],
    mutationFn: (req: CreateVacationDocumentRequest) => createVacation(req),
    onSuccess: (data) => {
      onSuccess && onSuccess(data);
    },
    onError: () => {
      onError && onError();
    },
  });

  return { createVacation: mutate, isLoading: isPending };
}

export function useVacationDocument(id: number) {
  const { data, isLoading } = useQuery<VacationDocument>({
    queryKey: ['documents', 'vacations', id],
    queryFn: () => getVacationDocument(id),
  });

  return { vacationDocument: data, isLoading };
}
