'use client';

import { useEffect, useRef, useState } from 'react';

import { GiCancel } from 'react-icons/gi';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { TbArrowsExchange } from 'react-icons/tb';

import { useUpdateUserSignature } from '@/domain/user/query/user';
import useToast from '@/shared/hooks/useToast';

import { useTranslations } from 'next-intl';

interface UpdateSignatureModalProps {
  show: boolean;
  onClose?: () => void;
}

export default function UpdateSignatureModal({ show, onClose }: UpdateSignatureModalProps) {
  // i18n
  const t = useTranslations('profile.signatureModal');

  // ref
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // status
  const [signatureFile, setSignatureFile] = useState<File>();

  // hooks
  const { push } = useToast();

  // query
  const { updateSignature, isLoading } = useUpdateUserSignature(
    () => {
      push(t('successToast'), 'success');

      handleClose();
    },
    () => {
      push(t('errorToast'), 'error');
    },
  );

  // useEffect
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (show) {
      setSignatureFile(undefined);
      ref.current.showModal();
    } else {
      ref.current.close();
    }
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

  const handleUpdateAvatar = () => {
    if (!signatureFile) {
      return;
    }

    updateSignature(signatureFile);
  };

  const handleClick = () => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.click();
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (e.dataTransfer && e.dataTransfer.files) {
      setSignatureFile(e.dataTransfer.files[0]);
    }
  };

  const handlePreventDragEvent = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
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
          <div
            className="hover:border-primary flex h-[200px] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 transition-colors"
            onClick={handleClick}
            onDragEnter={handlePreventDragEvent}
            onMouseLeave={handlePreventDragEvent}
            onDragOver={handlePreventDragEvent}
            onDrop={handleFileDrop}
          >
            {signatureFile ? (
              // 서명은 검정 잉크 + 투명 배경이므로 미리보기 내부만 밝게 유지
              <div className="flex size-full items-center justify-center rounded-xl bg-white p-4">
                <img
                  className="max-h-full max-w-full object-contain"
                  src={URL.createObjectURL(signatureFile)}
                  alt={t('previewAlt')}
                />
              </div>
            ) : (
              <div className="text-base-content/60 flex size-full flex-col items-center justify-center gap-4">
                <IoCloudUploadOutline className="size-10" />
                <span className="text-sm">{t('dropzone')}</span>
              </div>
            )}

            <input
              type="file"
              className="hidden"
              ref={inputRef}
              onChange={(e) => e.target.files && setSignatureFile(e.target.files[0])}
            />
          </div>

          <div className="w-full">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-warning text-sm">{t('transparentWarning')}</span>
            </div>
          </div>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn btn-ghost w-32" onClick={handleClose}>
            <GiCancel className="size-6" />
            {t('cancel')}
          </button>
          <button className="btn btn-primary w-32" disabled={isLoading || !signatureFile} onClick={handleUpdateAvatar}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                {t('submitting')}
              </>
            ) : (
              <>
                <TbArrowsExchange className="size-6" />
                {t('submit')}
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
