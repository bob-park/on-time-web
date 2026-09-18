type RoleType = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_USER';

interface Role {
  id: number;
  type: RoleType;
  description?: string;
}

interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  phone?: string;
  cellPhone?: string;
  role: Role;
  position: Position;
  groups: UserGroup[];
  leaveEntry?: UserLeaveEntry;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
  isLeader?: boolean;
  teamUserDescription?: boolean;
  employment?: UserEmployment;
}

interface UserLeaveEntry {
  id: number;
  year: number;
  totalLeaveDays: number;
  usedLeaveDays: number;
  totalCompLeaveDays: number;
  usedCompLeaveDays: number;
  createdDate: Date;
  lastModifiedDate?: Date;
}

interface UserCompLeaveEntry {
  id: number;
  contents: string;
  effectiveDate: Date;
  leaveDays: number;
  usedDays: number;
  createdDate: Date;
  createdBy?: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}

interface UpdateUserPasswordRequest {
  updatePassword: string;
}

interface UserEmployment {
  id: number;
  userUniqueId: string;
  status: string;
  effectiveDate: Date;
}

type SearchUserLeaveEntryRequest = {
  year: number;
};

interface UserUsedVacation {
  userUniqueId: string;
  year: number;
  usedVacations: UsedVacation[];
}

interface UsedVacation {
  month: number;
  used: number;
  usedComp: number;
}

interface UserGroup {
  id: string;
  isLeader: boolean;
  description?: string;
  group: Team;
}
