'use client';

import { useEffect, useRef } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

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
      push('결재 재촉하였습니다.', 'info');
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
        displayMessage: `${currentUser.team?.name || ''} ${currentUser.username} ${currentUser.position?.name || ''} 이(가) 빨리 결재해달라고 재촉하였습니다.`,
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
            <h3 className="text-lg font-bold">결재 재촉하기</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-start justify-center gap-4">
          <p className="text-base">이거 요청하면.. 혹시 혼날까?</p>
          <p className="text-base font-semibold text-red-400">그래도 재촉하시겠습니까?</p>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn w-32" onClick={handleClose}>
            <FaTimes className="size-6" />
            안할까?
          </button>
          <button className="btn btn-primary w-36" disabled={isLoading} onClick={handlePressApproval}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                재촉중
              </>
            ) : (
              <>
                <FaCheck className="size-5" />
                그래도 할꺼?
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
