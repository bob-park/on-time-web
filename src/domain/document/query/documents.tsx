import { searchDocument } from '@/domain/document/api/documents';

import { useQuery } from '@tanstack/react-query';

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
