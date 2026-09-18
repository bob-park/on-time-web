'use client';

import { useState } from 'react';

import UserAvatar from '@/domain/users/components/UserAvatar';
import { useUser } from '@/domain/users/queries/user';

import { useTranslations } from 'next-intl';

import UpdateAvatarModal from './UpdateAvatarModal';

function SkeletonField() {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-base-300 h-3 w-16 animate-pulse rounded" />
      <div className="bg-base-300 h-4 w-32 animate-pulse rounded" />
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-2 text-[11px] font-semibold tracking-[1.4px] uppercase">{label}</span>
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
  const { user: currentUser, isLoading } = useUser();

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex flex-shrink-0 flex-col items-center gap-3">
            <div className="bg-base-300 h-24 w-24 animate-pulse rounded-full" />
            <div className="bg-base-300 h-8 w-24 animate-pulse rounded-[10px]" />
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
              avatar={currentUser && `/api/v1/users/${currentUser.id}/avatar`}
              size="profile"
              isOnline={false}
            />
            <button className="btn btn-subtle btn-sm" onClick={() => setShowUpdateAvatarModal(true)}>
              {t('changeAvatar')}
            </button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <InfoField label={t('labelTeam')} value={currentUser?.groups?.[0]?.group.name} />
            <InfoField label={t('labelPosition')} value={currentUser?.position.name} />
            <InfoField label={t('labelName')} value={currentUser?.username} />
            <InfoField label={t('labelEmail')} value={currentUser?.email} />
          </div>
        </div>
      )}
      <UpdateAvatarModal show={showUpdateAvatarModal} onClose={() => setShowUpdateAvatarModal(false)} />
    </>
  );
}
