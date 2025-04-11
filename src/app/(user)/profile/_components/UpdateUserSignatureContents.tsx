'use client';

import { useState } from 'react';

import { MdEdit } from 'react-icons/md';

import Image from 'next/image';

import { useGetCurrentUser } from '@/domain/user/query/user';

import cx from 'classnames';

import UpdateSignatureModal from './UpdateSignatureModal';

export default function UpdateUserSignatureContents() {
  // state
  const [isHover, setIsHover] = useState<boolean>();
  const [showUpdateSignatureModal, setShowUpdateSignatureModal] = useState<boolean>(false);

  // query
  const { currentUser } = useGetCurrentUser();

  return (
    <>
      <div className="bg-base-200 flex flex-row items-center justify-center gap-5 rounded-xl px-5 py-2">
        <div className="flex-1">
          <div className="flex flex-col gap-3 text-lg">
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
              <legend className="fieldset-legend text-base">결재 문서 서명 변경</legend>

              <label className="fieldset-label">서명</label>
              <div
                className="input relative h-[200px] w-[400px]"
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                onClick={() => setShowUpdateSignatureModal(true)}
              >
                {currentUser && (
                  <Image
                    className="aspect-auto"
                    src={`/api/users/${currentUser.uniqueId}/signature`}
                    alt="user signature"
                    fill
                  />
                )}
                <div
                  className={cx(
                    'absolute top-0 left-0 flex h-[200] w-[400] items-center justify-center p-5 transition-all duration-300 hover:cursor-pointer hover:bg-gray-500/50',
                  )}
                >
                  <MdEdit className={cx('size-24 text-gray-200', { invisible: !isHover })} />
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
      <UpdateSignatureModal show={showUpdateSignatureModal} onClose={() => setShowUpdateSignatureModal(false)} />
    </>
  );
}
