import { TbArrowBack } from 'react-icons/tb';

import Link from 'next/link';

import CardPageTitle from './_components/CardPageTitle';

export default function Forbidden() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2">
      <div className="mt-36 flex cursor-default select-none flex-row items-center justify-center gap-4 text-9xl font-bold text-gray-400">
        <CardPageTitle placeholder="Wow">
          <span>4</span>
        </CardPageTitle>
        <CardPageTitle placeholder="Forbidden">
          <span>0</span>
        </CardPageTitle>
        <CardPageTitle placeholder="Sorry!!">
          <span>3</span>
        </CardPageTitle>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-bold">FORBIDDEN</h2>
      </div>

      <div className="mt-5">
        <p className="text-xl font-medium">
          이 페이지의 성벽이
          <span className="px-1 text-2xl font-bold text-gray-500">🏰 너무 높아</span>
          <span className="px-1 text-2xl font-bold text-gray-500">🛠️현재 장비</span>로 올라갈수가 없어요!!
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
