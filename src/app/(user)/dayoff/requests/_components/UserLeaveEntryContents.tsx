'use client';

import UserLeaveEntry from '@/domain/user/components/UserLeaveEntry';
import { useGetCurrentUser } from '@/domain/user/query/user';

import dayjs from 'dayjs';

export default function UserLeaveEntryContents() {
  // query
  const { currentUser } = useGetCurrentUser();

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div>
        <UserLeaveEntry {...currentUser?.leaveEntry} year={currentUser?.leaveEntry.year || dayjs().year()} />
      </div>
    </div>
  );
}
