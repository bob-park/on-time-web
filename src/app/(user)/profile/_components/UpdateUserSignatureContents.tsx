'use client';

import { useState } from 'react';

import Image from 'next/image';

import { useGetCurrentUser } from '@/domain/user/query/user';

import UpdateSignatureModal from './UpdateSignatureModal';

export default function UpdateUserSignatureContents() {
  // state
  const [isError, setIsError] = useState<boolean>(false);
  const [showUpdateSignatureModal, setShowUpdateSignatureModal] = useState<boolean>(false);

  // query
  const { currentUser } = useGetCurrentUser();

  const hasSignature = !!currentUser && !isError;

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 border-b border-slate-100 pb-3 text-lg font-semibold text-gray-900">결재 서명</h3>

        <div className="flex flex-col gap-4">
          <div className="relative h-[160px] w-full max-w-[400px] overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
            {currentUser && !isError ? (
              <Image
                className="object-contain"
                src={`/api/users/${currentUser.id}/signature`}
                alt="user signature"
                fill
                onError={() => setIsError(true)}
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span className="text-sm text-slate-400">서명이 등록되지 않았습니다</span>
              </div>
            )}
          </div>

          {hasSignature && (
            <p className="text-sm text-red-500">⚠ 배경이 투명해야 정상적으로 서명이 보입니다.</p>
          )}

          <div className="flex justify-end">
            <button
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              onClick={() => setShowUpdateSignatureModal(true)}
            >
              {hasSignature ? '서명 변경' : '서명 등록'}
            </button>
          </div>
        </div>
      </div>
      <UpdateSignatureModal show={showUpdateSignatureModal} onClose={() => setShowUpdateSignatureModal(false)} />
    </>
  );
}
