import { SlicePattern } from 'zustand';

const createUserSlice: SlicePattern<UserState> = (set) => ({
  updateCurrentUser: (user) =>
    set(
      () => {
        return {
          currentUser: user,
        };
      },
      false,
      {
        type: 'user/updateCurrentUser',
      },
    ),
});

export default createUserSlice;
