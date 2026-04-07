'use client';

import { useState } from 'react';

import UserAvatar from '@/domain/user/components/UserAvatar';
import { useGetCurrentUser } from '@/domain/user/query/user';

import UpdateAvatarModal from './UpdateAvatarModal';

function SkeletonField() {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-3 w-14 animate-pulse rounded bg-slate-200" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
    </div>
  );
}

export default function PersonalInfoContents() {
  // state
  const [showUpdateAvatarModal, setShowUpdateAvatarModal] = useState<boolean>(false);

  // query
  const { currentUser, isLoading } = useGetCurrentUser();

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 border-b border-slate-100 pb-3 text-lg font-semibold text-slate-900">개인 정보</h3>

        {isLoading ? (
          <div className="flex gap-8">
            <div className="flex flex-shrink-0 flex-col items-center gap-3">
              <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3.5 md:grid-cols-2">
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <div className="md:col-span-2">
                <SkeletonField />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-8">
            <div className="flex flex-shrink-0 flex-col items-center gap-3">
              <UserAvatar
                alt={currentUser?.username || ''}
                avatar={currentUser && `/api/users/${currentUser.id}/avatar`}
                size="profile"
                isOnline={false}
              />
              <button
                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-100"
                onClick={() => setShowUpdateAvatarModal(true)}
              >
                아바타 변경
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3.5 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">소속 팀</span>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  {currentUser?.group.name}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">직급</span>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  {currentUser?.position.name}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">이름</span>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  {currentUser?.username}
                </div>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">E-MAIL</span>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  {currentUser?.email}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <UpdateAvatarModal show={showUpdateAvatarModal} onClose={() => setShowUpdateAvatarModal(false)} />
    </>
  );
}
