'use client';

import { useState } from 'react';

import UserAvatar from '@/domain/user/components/UserAvatar';
import { useGetCurrentUser } from '@/domain/user/query/user';

import { useTranslations } from 'next-intl';

import UpdateAvatarModal from './UpdateAvatarModal';

function SkeletonField() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-base-content/60 text-[11px] font-semibold tracking-[1.4px] uppercase">{label}</span>
      <span className="text-[15px]">{value}</span>
    </div>
  );
}

export default function PersonalInfoContents() {
  // i18n
  const t = useTranslations('profile.personalInfo');

  // state
  const [showUpdateAvatarModal, setShowUpdateAvatarModal] = useState<boolean>(false);

  // query
  const { currentUser, isLoading } = useGetCurrentUser();

  return (
    <>
      <div className="animate-fade-up bg-base-300 w-full rounded-lg p-5">
        <div className="mb-5 border-b border-white/10 pb-4">
          <h3 className="text-lg font-semibold">{t('title')}</h3>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex flex-shrink-0 flex-col items-center gap-3">
              <div className="h-24 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex flex-shrink-0 flex-col items-center gap-3.5">
              <UserAvatar
                alt={currentUser?.username || ''}
                avatar={currentUser && `/api/users/${currentUser.id}/avatar`}
                size="profile"
                isOnline={false}
              />
              <button className="btn btn-outline btn-sm rounded-full" onClick={() => setShowUpdateAvatarModal(true)}>
                {t('changeAvatar')}
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              <InfoField label={t('labelTeam')} value={currentUser?.group.name} />
              <InfoField label={t('labelPosition')} value={currentUser?.position.name} />
              <InfoField label={t('labelName')} value={currentUser?.username} />
              <InfoField label={t('labelEmail')} value={currentUser?.email} />
            </div>
          </div>
        )}
      </div>
      <UpdateAvatarModal show={showUpdateAvatarModal} onClose={() => setShowUpdateAvatarModal(false)} />
    </>
  );
}
