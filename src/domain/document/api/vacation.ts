import api from '@/shared/api';

import delay from '@/utils/delay';

export async function createVacation(req: CreateVacationDocumentRequest) {
  const result = await api
    .post('/api/documents/vacations', {
      json: {
        ...req,
      },
    })
    .json<VacationDocument>();

  await delay(1_000);

  return result;
}

export async function getVacationDocument(id: number) {
  return api.get(`/api/documents/vacations/${id}`).json<VacationDocument>();
}

export async function searchVacationDocuments(req: SearchVacationDocumentRequest) {
  return api.get('/api/documents/vacations', { searchParams: req }).json<Page<VacationDocument>>();
}
