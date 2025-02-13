import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

const createAttendanceSlice: SlicePattern<AttendanceState, BoundState> = (set) => ({
  showModal: true,
  updateShowModal: (show: boolean) =>
    set(
      (state) => {
        return {
          showModal: show,
        };
      },
      false,
      {
        type: 'attendance/updateShowModal',
      },
    ),
});

export default createAttendanceSlice;
