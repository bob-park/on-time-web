'use client';

import { useState } from 'react';

import Image from 'next/image';

import { useUser } from '@/domain/users/queries/user';

import { useTranslations } from 'next-intl';

import UpdateSignatureModal from './UpdateSignatureModal';

export default function UpdateUserSignatureContents() {
  // i18n
  const t = useTranslations('profile.signature');

  // state
  const [isError, setIsError] = useState<boolean>(false);
  const [showUpdateSignatureModal, setShowUpdateSignatureModal] = useState<boolean>(false);

  // query
  const { user: currentUser } = useUser();

  const hasSignature = !!currentUser && !isError;

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col gap-4">
          <div className="border-base-300 relative h-[160px] w-full max-w-[400px] overflow-hidden rounded-lg border border-dashed">
            {currentUser && !isError ? (
              // 서명 PNG 는 검정 잉크 + 투명 배경이라 다크 배경에서 안 보이므로 프리뷰 내부만 밝게 유지
              <Image
                className="bg-white object-contain"
                src={`/api/v1/users/${currentUser.id}/signature`}
                alt={t('alt')}
                fill
                onError={() => setIsError(true)}
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span className="text-3 text-sm">{t('empty')}</span>
              </div>
            )}
          </div>

          {hasSignature && <p className="text-warning text-xs">{t('transparentWarning')}</p>}

          <div className="flex justify-end">
            <button className="btn btn-outline btn-sm" onClick={() => setShowUpdateSignatureModal(true)}>
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
