import { SlicePattern } from 'zustand';

const createUserSlice: SlicePattern<UserState> = (set) => ({
  currentUser: undefined,
});

export default createUserSlice;
