import api from '@/shared/api';

import delay from '@/utils/delay';

export async function createOverTimeWorkDocument(req: CreateOverTimeWorkDocumentRequest) {
  const result = await api.post('/api/documents/overtimes', { json: req }).json<OverTimeWorkDocument>();

  await delay(1_000);

  return result;
}

export async function getOverTimeWorkDocument(id: number) {
  return api.get(`/api/documents/overtimes/${id}`).json<OverTimeWorkDocument>();
}
