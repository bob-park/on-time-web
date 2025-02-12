import { TbArrowBack } from 'react-icons/tb';

import Link from 'next/link';

import CardPageTitle from './_components/CardPageTitle';

export default function NotFound() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2">
      <div className="mt-36 flex cursor-default select-none flex-row items-center justify-center gap-4 text-9xl font-bold text-gray-400">
        <CardPageTitle placeholder="Oops">
          <span>4</span>
        </CardPageTitle>
        <CardPageTitle placeholder="Not Here">
          <span>0</span>
        </CardPageTitle>
        <CardPageTitle placeholder="Sorry">
          <span>4</span>
        </CardPageTitle>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-bold">PAGE NOT FOUND</h2>
      </div>

      <div className="mt-5">
        <p className="text-xl font-medium">
          아마도 페이지가
          <span className="px-1 text-2xl font-bold text-gray-500">💥부서지</span>
          거나,
          <span className="px-1 text-2xl font-bold text-gray-500">💣폭파</span>
          되었어요!!
        </p>
      </div>

      <div className="mt-5">
        <Link className="btn btn-neutral" href="/dashboard">
          <TbArrowBack className="h-6 w-6" />
          돌아가기
        </Link>
      </div>
    </div>
  );
}
