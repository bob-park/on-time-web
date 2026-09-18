import api from '@/shared/api';
import { PagedModel } from '@/shared/api/common.dto';
import delay from '@/utils/delay';

export async function createVacation(req: CreateVacationDocumentRequest) {
  const result = await api
    .post('/api/v1/documents/vacations', {
      json: {
        ...req,
      },
    })
    .json<VacationDocument>();

  await delay(1_000);

  return result;
}

export async function getVacationDocument(id: number) {
  return api.get(`/api/v1/documents/vacations/${id}`).json<VacationDocument>();
}

export async function searchVacationDocuments(req: SearchVacationDocumentRequest) {
  return api.get('/api/v1/documents/vacations', { searchParams: req }).json<PagedModel<VacationDocument>>();
}
