import createUserSlice from '@/domain/user/store/slice';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<BoundState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createUserSlice(...a),
      })),
      {
        name: 'on-time-web',
      },
    ),
    { name: 'on-time-web', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export type BoundState = UserState;
