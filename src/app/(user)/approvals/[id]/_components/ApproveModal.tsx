'use client';

import { useEffect, useRef } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { useApproveDocument } from '@/domain/document/query/documents';
import useToast from '@/shared/hooks/useToast';

import { useTranslations } from 'next-intl';

interface ApproveModalProps {
  show: boolean;
  id: number;
  onClose?: () => void;
}

export default function ApproveModal({ show, id, onClose }: ApproveModalProps) {
  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // i18n
  const t = useTranslations('approval.detail.approve');

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
      <div className="modal-box rounded-xl bg-[#252525] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">{t('title')}</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-start justify-center gap-4">
          <p className="text-base">{t('body')}</p>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn btn-ghost w-32" onClick={handleClose}>
            <FaTimes className="size-6" />
            {t('cancel')}
          </button>
          <button className="btn btn-primary w-32" disabled={isLoading} onClick={handleApprove}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                {t('confirming')}
              </>
            ) : (
              <>
                <FaCheck className="size-5" />
                {t('confirm')}
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
