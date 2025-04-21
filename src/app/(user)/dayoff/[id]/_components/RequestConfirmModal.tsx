'use client';

import { useEffect, useRef } from 'react';

import { FaTimes } from 'react-icons/fa';
import { PiUploadFill } from 'react-icons/pi';

import { useRequestDocument } from '@/domain/document/query/documents';

import useToast from '@/shared/hooks/useToast';

interface RequestConfirmModalProps {
  show: boolean;
  documentId: number;
  onClose?: () => void;
}

export default function RequestConfirmModal({ show, documentId, onClose }: RequestConfirmModalProps) {
  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // hooks
  const { push } = useToast();

  // query
  const { request, isLoading } = useRequestDocument(
    () => {
      handleClose();
      push('문서가 신청되었습니다.', 'success');
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

  const handleCancel = () => {
    request({ id: documentId });
  };

  return (
    <dialog ref={ref} className="modal" onKeyDownCapture={handleKeyboardDown}>
      <div className="modal-box">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">신청하기</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-start justify-center gap-4">
          <p className="text-base">이 문서를 신청할까?</p>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn w-32" onClick={handleClose}>
            <FaTimes className="size-6" />
            안할까?
          </button>
          <button className="btn btn-primary w-36" disabled={isLoading} onClick={handleCancel}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                신청 중
              </>
            ) : (
              <>
                <PiUploadFill className="size-5" />
                신청?
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
