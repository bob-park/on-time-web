import api from '@/shared/api';

import delay from '@/utils/delay';

export async function searchDocument(req: SearchDocumentRequest) {
  const result = await api.get(`/api/documents`, { searchParams: req }).json<Page<Document>>();

  return result;
}
