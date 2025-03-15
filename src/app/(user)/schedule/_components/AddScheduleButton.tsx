'use client';

import { IoAddCircle } from 'react-icons/io5';

import { useRouter } from 'next/navigation';

import { useStore } from '@/shared/store/rootStore';

export default function AddScheduleButton() {
  // router
  const router = useRouter();

  // store
  const updateShow = useStore((state) => state.updateShowModal);

  // handle
  const handleClick = () => {
    updateShow(true);

    router.push('/schedule/add', { scroll: false });
  };

  return (
    <button className="btn btn-primary" type="button" onClick={handleClick}>
      <IoAddCircle className="size-6" />
      추가
    </button>
  );
}
