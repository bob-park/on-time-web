import { User } from '@/domain/users/apis/users.dto';

interface Team {
  id: number;
  name: string;
  description?: string;
  users?: User[];
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
  isLeader?: boolean;
  teamUserDescription?: boolean;
}

export type { Team };
