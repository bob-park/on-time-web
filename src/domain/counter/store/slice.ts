import { BoundState } from '@/shared/rootStore';

import { SlicePattern } from 'zustand';

const createCounterSlice: SlicePattern<CounterState, BoundState> = (set) => ({
  count: 0,
  increment: () =>
    set(
      (state) => {
        return {
          count: state.count++,
        };
      },
      false,
      {
        type: 'counter/increment',
      },
    ),
  decrement: () =>
    set(
      (state) => {
        return {
          count: state.count--,
        };
      },
      false,
      {
        type: 'counter/decrement',
      },
    ),
});

export default createCounterSlice;
