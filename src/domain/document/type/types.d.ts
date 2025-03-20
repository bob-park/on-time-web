/*
 * document
 */
type DocumentType = 'VACATION';
type DocumentStatus = 'WAITING' | 'APPROVED' | 'REJECTED'

interface Document {
  id: number;
  type: DocumentType;
  status: DocumentStatus;
  user: User;
  createdDate: Date;
  createdBy?: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}

/*
 * vacation
 */
type VacationType = 'GENERAL' | 'COMPENSATORY' | 'OFFICIAL';
type VacationSubType = 'AM_HALF_DAY_OFF' | 'PM_HALF_DAY_OFF';

interface VacationDocument extends Document {
  vacationType: VacationType;
  vacationSubType?: VacationSubType;
  startDate: Date;
  endDate: Date;
  usedDays: number;
  reason: string;
}

interface CreateVacationDocumentRequest {
  vacationType: VacationType;
  vacationSubType?: VacationSubType;
  startDate: Date;
  endDate: Date;
  reason: string;
  compLeaveEntryIds?: number[];
}
