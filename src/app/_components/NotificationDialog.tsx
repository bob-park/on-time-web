'use client';

import { useEffect, useRef } from 'react';

import { IoLogoAndroid, IoLogoApple } from 'react-icons/io5';

import Link from 'next/link';

export default function NotificationDialog({ open, onClose }: Readonly<{ open: boolean; onClose: () => void }>) {
  // useRef
  const dialogRef = useRef<HTMLDialogElement>(null);

  // useEffect
  useEffect(() => {
    if (!dialogRef.current) {
      return;
    }

    open ? dialogRef.current.showModal() : dialogRef.current.close();
  }, [open]);

  // handle
  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <h3 className="text-lg font-bold">On Time 앱 설치 방법</h3>
        <div className="mt-12 flex w-full flex-row items-center justify-center gap-4">
          <Link
            className="btn"
            href="https://testflight.apple.com/join/dWYhDVCH"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IoLogoApple className="size-6" />
            iOS 앱
          </Link>
          <Link
            className="btn"
            href="https://www.icloud.com/iclouddrive/0efxt0212ZsHLM497sZgXP-Zg#build-1751619928703"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IoLogoAndroid className="size-6" />
            Android 앱
          </Link>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
