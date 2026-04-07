'use client';

import { useEffect, useRef } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { useApproveDocument } from '@/domain/document/query/documents';

import useToast from '@/shared/hooks/useToast';

interface ApproveModalProps {
  show: boolean;
  id: number;
  onClose?: () => void;
}

export default function ApproveModal({ show, id, onClose }: ApproveModalProps) {
  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // hooks
  const { push } = useToast();

  // query
  const { approve, isLoading } = useApproveDocument(
    () => {
      push('문서가 승인되었습니다.', 'success');
      handleClose();
    },
    () => {
      push('승인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
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

  const handleApprove = () => {
    approve({ id });
  };

  return (
    <dialog ref={ref} className="modal" onKeyDownCapture={handleKeyboardDown}>
      <div className="modal-box">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">결재 승인</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-start justify-center gap-4">
          <p className="text-base">이 문서를 승인하시겠습니까?</p>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn w-32" onClick={handleClose}>
            <FaTimes className="size-6" />
            취소
          </button>
          <button className="btn btn-primary w-32" disabled={isLoading} onClick={handleApprove}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                승인 중
              </>
            ) : (
              <>
                <FaCheck className="size-5" />
                승인
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
