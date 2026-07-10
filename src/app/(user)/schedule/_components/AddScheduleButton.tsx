'use client';

import { IoAddCircle } from 'react-icons/io5';

import { useRouter } from 'next/navigation';

import { useStore } from '@/shared/store/rootStore';

import { useTranslations } from 'next-intl';

export default function AddScheduleButton() {
  // hooks
  const t = useTranslations('schedule');

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
      {t('add')}
    </button>
  );
}
