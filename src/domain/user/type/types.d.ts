type RoleType = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_USEr';

interface Role {
  id: number;
  type: RoleType;
  description?: string;
}

interface User {
  uniqueId: string;
  userId: string;
  username: string;
  email: string;
  phone?: string;
  cellPhone?: string;
  role: Role;
  position: Position;
  team: Team;
  leaveEntry: UserLeaveEntry;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
  isLeader?: boolean;
  teamUserDescription?: boolean;
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
