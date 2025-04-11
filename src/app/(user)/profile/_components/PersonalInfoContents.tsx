'use client';

import { useState } from 'react';

import { MdEdit } from 'react-icons/md';

import UserAvatar from '@/domain/user/components/UserAvatar';
import { useGetCurrentUser } from '@/domain/user/query/user';

import cx from 'classnames';

import UpdateAvatarModal from './UpdateAvatarModal';

export default function PersonalInfoContents() {
  // state
  const [isAvatarHover, setIsAvatarHover] = useState<boolean>(false);
  const [showUpdateAvatarModal, setShowUpdateAvatarModal] = useState<boolean>(false);

  // query
  const { currentUser } = useGetCurrentUser();

  return (
    <>
      <div className="bg-base-200 flex flex-row items-center justify-center gap-5 rounded-xl px-5 py-2">
        <div
          className="relative"
          onMouseEnter={() => setIsAvatarHover(true)}
          onMouseLeave={() => setIsAvatarHover(false)}
        >
          <UserAvatar
            alt={currentUser?.username || ''}
            avatar={currentUser && `/api/users/${currentUser.uniqueId}/avatar`}
            size="lg"
            isOnline={false}
          />
          <div
            className={cx(
              'hover:bg-base-300/50 absolute top-0 left-0 flex size-48 items-center justify-center rounded-full p-5 transition-all duration-300 hover:cursor-pointer',
            )}
            onClick={() => setShowUpdateAvatarModal(true)}
          >
            <MdEdit className={cx('size-24 text-gray-200', { invisible: !isAvatarHover })} />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col gap-3 text-lg">
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
              <legend className="fieldset-legend text-base">개인 정보</legend>

              <label className="fieldset-label">소속 팀</label>
              <p className="input w-full">{currentUser?.team.name}</p>

              <label className="fieldset-label">직책</label>
              <p className="input w-full">{currentUser?.team.teamUserDescription}</p>

              <label className="fieldset-label">직급</label>
              <p className="input w-full">{currentUser?.position.name}</p>

              <label className="fieldset-label">이름</label>
              <p className="input w-full">{currentUser?.username}</p>

              <label className="fieldset-label">e-mail</label>
              <p className="input w-full">{currentUser?.email}</p>
            </fieldset>
          </div>
        </div>
      </div>
      <UpdateAvatarModal show={showUpdateAvatarModal} onClose={() => setShowUpdateAvatarModal(false)} />
    </>
  );
}
