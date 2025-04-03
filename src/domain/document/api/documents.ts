import api from '@/shared/api';

export async function searchDocument(req: SearchDocumentRequest) {
  const result = await api.get(`/api/documents`, { searchParams: req }).json<Page<Document>>();

  return result;
}
