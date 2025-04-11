'use client';

import { useEffect, useRef, useState } from 'react';

import { GiCancel } from 'react-icons/gi';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { TbArrowsExchange } from 'react-icons/tb';

import { useUpdateUserSignature } from '@/domain/user/query/user';

import useToast from '@/shared/hooks/useToast';

interface UpdateSignatureModalProps {
  show: boolean;
  onClose?: () => void;
}

export default function UpdateSignatureModal({ show, onClose }: UpdateSignatureModalProps) {
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
      push('결재 서명이 변경되었습니다. 화면에 보이는 결재 서명은 추후 변경됩니다.', 'success');

      handleClose();
    },
    () => {
      push('먼가 잘못되었으니, 알아서 하셈', 'error');
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
      <div className="modal-box">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">결재 서명 수정</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-start justify-center gap-4">
          <div
            className="bg-base-300 h-[200px] w-full cursor-pointer rounded-xl"
            onClick={handleClick}
            onDragEnter={handlePreventDragEvent}
            onMouseLeave={handlePreventDragEvent}
            onDragOver={handlePreventDragEvent}
            onDrop={handleFileDrop}
          >
            {signatureFile ? (
              <div className="flex size-full flex-col items-center justify-center gap-5">
                <img
                  className="aspect-auto h-[200] w-[400] rounded-full"
                  src={URL.createObjectURL(signatureFile)}
                  alt="change avatar"
                />
              </div>
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-5">
                <div>
                  <IoCloudUploadOutline className="size-10" />
                </div>
                <span>Drag and drop or click to upload image</span>
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
              <span className="text-sm text-red-500">배경이 투명해야 정상적으로 서명이 보입니다.</span>
            </div>
          </div>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn w-32" onClick={handleClose}>
            <GiCancel className="size-6" />
            안할까?
          </button>
          <button className="btn btn-primary w-32" disabled={isLoading || !signatureFile} onClick={handleUpdateAvatar}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                변경중
              </>
            ) : (
              <>
                <TbArrowsExchange className="size-6" />
                변경
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
