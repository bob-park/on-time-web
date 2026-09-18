'use client';

import { useEffect, useRef, useState } from 'react';

import { GiCancel } from 'react-icons/gi';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { TbArrowsExchange } from 'react-icons/tb';

import { useUpdateUserAvatar } from '@/domain/users/queries/user';
import useToast from '@/shared/hooks/useToast';

import { useTranslations } from 'next-intl';

interface UpdateAvatarModalProps {
  show: boolean;
  onClose?: () => void;
}

export default function UpdateAvatarModal({ show, onClose }: UpdateAvatarModalProps) {
  // i18n
  const t = useTranslations('profile.avatarModal');

  // ref
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // status
  const [avatarFile, setAvatarFile] = useState<File>();

  // hooks
  const { push } = useToast();

  // query
  const { updateAvatar, isLoading } = useUpdateUserAvatar(
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
      setAvatarFile(undefined);
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
    if (!avatarFile) {
      return;
    }

    updateAvatar(avatarFile);
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
      setAvatarFile(e.dataTransfer.files[0]);
    }
  };

  const handlePreventDragEvent = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
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
          <div
            className="hover:border-primary border-base-300 flex h-[200px] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed transition-colors"
            onClick={handleClick}
            onDragEnter={handlePreventDragEvent}
            onMouseLeave={handlePreventDragEvent}
            onDragOver={handlePreventDragEvent}
            onDrop={handleFileDrop}
          >
            {avatarFile ? (
              <div className="flex size-full flex-col items-center justify-center gap-5">
                <img className="size-48 rounded-full" src={URL.createObjectURL(avatarFile)} alt={t('previewAlt')} />
              </div>
            ) : (
              <div className="text-2 flex size-full flex-col items-center justify-center gap-4">
                <IoCloudUploadOutline className="size-10" />
                <span className="text-sm">{t('dropzone')}</span>
              </div>
            )}

            <input
              type="file"
              className="hidden"
              ref={inputRef}
              onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])}
            />
          </div>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn btn-ghost w-32" onClick={handleClose}>
            <GiCancel className="size-6" />
            {t('cancel')}
          </button>
          <button className="btn btn-primary w-32" disabled={isLoading || !avatarFile} onClick={handleUpdateAvatar}>
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
