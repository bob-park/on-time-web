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
