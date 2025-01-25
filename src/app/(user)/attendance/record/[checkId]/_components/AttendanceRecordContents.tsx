'use client';

import { useEffect } from 'react';

import { useStore } from '@/shared/rootStore';

import { useRecordAttendance } from '@/domain/attendance/query/AttendanceRecord';

interface AttendanceRecordContentsProps {
  checkId: string;
}

export default function AttendanceRecordContents({ checkId }: AttendanceRecordContentsProps) {
  // store
  const currentUser = useStore((state) => state.currentUser);

  // query
  const { record, isLoading } = useRecordAttendance();

  // useEffect
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    record({ checkId, userUniqueId: currentUser.uniqueId });
  }, [currentUser]);

  return <div className=""></div>;
}
