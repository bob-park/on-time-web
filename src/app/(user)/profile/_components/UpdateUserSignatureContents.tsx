'use client';

import { useState } from 'react';

import Image from 'next/image';

import { useGetCurrentUser } from '@/domain/user/query/user';

import { useTranslations } from 'next-intl';

import UpdateSignatureModal from './UpdateSignatureModal';

export default function UpdateUserSignatureContents() {
  // i18n
  const t = useTranslations('profile.signature');

  // state
  const [isError, setIsError] = useState<boolean>(false);
  const [showUpdateSignatureModal, setShowUpdateSignatureModal] = useState<boolean>(false);

  // query
  const { currentUser } = useGetCurrentUser();

  const hasSignature = !!currentUser && !isError;

  return (
    <>
      <div className="animate-fade-up bg-base-300 w-full rounded-lg p-5">
        <div className="mb-5 border-b border-white/10 pb-4">
          <h3 className="text-lg font-semibold">{t('title')}</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative h-[160px] w-full max-w-[400px] overflow-hidden rounded-lg border border-dashed border-white/20">
            {currentUser && !isError ? (
              // 서명 PNG 는 검정 잉크 + 투명 배경이라 다크 배경에서 안 보이므로 프리뷰 내부만 밝게 유지
              <Image
                className="bg-white object-contain"
                src={`/api/users/${currentUser.id}/signature`}
                alt={t('alt')}
                fill
                onError={() => setIsError(true)}
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span className="text-base-content/40 text-sm">{t('empty')}</span>
              </div>
            )}
          </div>

          {hasSignature && <p className="text-warning text-xs">{t('transparentWarning')}</p>}

          <div className="flex justify-end">
            <button className="btn btn-outline rounded-full" onClick={() => setShowUpdateSignatureModal(true)}>
              {hasSignature ? t('change') : t('register')}
            </button>
          </div>
        </div>
      </div>
      <UpdateSignatureModal
        show={showUpdateSignatureModal}
        onClose={() => {
          setShowUpdateSignatureModal(false);
          setIsError(false);
        }}
      />
    </>
  );
}
