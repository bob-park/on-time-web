'use client';

import { useEffect, useRef } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import Image from 'next/image';

import { useGetCurrentUser } from '@/domain/user/query/user';
import { useUserNotification } from '@/domain/user/query/userNotification';

import useToast from '@/shared/hooks/useToast';

interface PressApprovalModalProps {
  show: boolean;
  approvalUserUniqueId?: string;
  onClose?: () => void;
}

export default function PressApprovalModal({ show, approvalUserUniqueId, onClose }: PressApprovalModalProps) {
  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // hooks
  const { push } = useToast();

  // query
  const { currentUser } = useGetCurrentUser();
  const { sendMessage, isLoading } = useUserNotification(
    () => {
      handleClose();
      push('결재자한테 알림을 보냈습니다. 넌 이제 큰일남!!', 'success');
    },
    () => {
      push('머가 잘못되었는디?', 'error');
    },
  );

  // useEffect
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    show ? ref.current.showModal() : ref.current.close();
  }, [show]);

  // handle
  const handleClose = () => {
    onClose && onClose();
  };

  const handleKeyboardDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handlePressApproval = () => {
    if (!approvalUserUniqueId || !currentUser) {
      return;
    }

    sendMessage({
      userUniqueId: approvalUserUniqueId,
      body: {
        displayMessage: `${currentUser.team?.name || ''} ${currentUser.username} ${currentUser.position?.name || ''} 이(가) 결재 버튼 살짝 눌러달라고 요청했습니다.`,
        fields: [],
      },
    });
  };

  return (
    <dialog ref={ref} className="modal" onKeyDownCapture={handleKeyboardDown}>
      <div className="modal-box">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">빨리 진행시켜</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-center justify-center gap-4">
          <Image
            className="rounded-2xl"
            src="/approval/press-approval-img.png"
            alt="press img"
            width={300}
            height={300}
          />
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn w-36" onClick={handleClose}>
            <FaTimes className="size-6" />
            보내지 말까?
          </button>
          <button className="btn btn-primary w-36" disabled={isLoading} onClick={handlePressApproval}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                보내는중
              </>
            ) : (
              <>
                <FaCheck className="size-5" />
                보낼까?
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
