'use client';

import { useEffect, useRef, useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { useRejectDocument } from '@/domain/document/queries/documents';
import Badge from '@/shared/components/Badge';
import useToast from '@/shared/hooks/useToast';

import { useTranslations } from 'next-intl';

interface RejectModalProps {
  show: boolean;
  id: number;
  onClose?: () => void;
}

export default function RejectModal({ show, id, onClose }: RejectModalProps) {
  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // i18n
  const t = useTranslations('approval.detail.reject');

  // hooks
  const { push } = useToast();

  // state
  const [reason, setReason] = useState<string>('');

  // query
  const { reject, isLoading } = useRejectDocument(
    () => {
      push('문서가 반려되었습니다.', 'success');
      handleClose();
    },
    () => {
      push('반려 처리 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
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
    setReason('');
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
      <div className="modal-box bg-base-100 border-base-300 rounded-box shadow-whisper border">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">{t('title')}</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-start justify-center gap-4">
          <label className="input bg-base-100 border-base-300 mt-5 w-full">
            <span className="label">{t('reasonLabel')}</span>
            <input
              type="text"
              className="grow"
              placeholder={t('reasonPlaceholder')}
              maxLength={200}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Badge variant="neutral">{t('required')}</Badge>
          </label>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn btn-ghost w-32" onClick={handleClose}>
            <FaTimes className="size-6" />
            {t('cancel')}
          </button>
          <button className="btn btn-outline btn-error w-32" disabled={isLoading || !reason} onClick={handleReject}>
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
