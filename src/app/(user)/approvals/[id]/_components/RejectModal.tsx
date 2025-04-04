'use client';

import { useEffect, useRef, useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { useRejectDocument } from '@/domain/document/query/documents';

import useToast from '@/shared/hooks/useToast';

interface ApproveModalProps {
  show: boolean;
  id: number;
  onClose?: () => void;
}

export default function RejectModal({ show, id, onClose }: ApproveModalProps) {
  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // hooks
  const { push } = useToast();

  // state
  const [reason, setReason] = useState<string>('');

  // query
  const { reject, isLoading } = useRejectDocument(() => {
    push('문서가 반려되었습니다.', 'info');
    handleClose();
  });

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

  const handleReject = () => {
    reject({ id, req: { reason } });
  };

  return (
    <dialog ref={ref} className="modal" onKeyDownCapture={handleKeyboardDown}>
      <div className="modal-box">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">결재 반려</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-start justify-center gap-4">
          <label className="input mt-5 w-full">
            <span className="label">사유</span>
            <input
              type="text"
              className="grow"
              placeholder=""
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <span className="badge badge-neutral badge-xs">필수</span>
          </label>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn w-32" onClick={handleClose}>
            <FaTimes className="size-6" />
            안할까?
          </button>
          <button className="btn btn-primary w-32" disabled={isLoading || !reason} onClick={handleReject}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                반려중
              </>
            ) : (
              <>
                <FaCheck className="size-5" />
                할까?
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
