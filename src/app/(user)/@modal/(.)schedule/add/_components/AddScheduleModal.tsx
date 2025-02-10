'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

export default function AddScheduleModal() {
  // router
  const router = useRouter();

  // ref
  const dialogRef = useRef<HTMLDialogElement>(null);

  // state
  const [show, setShow] = useState<boolean>(true);

  // useEffect
  useEffect(() => {
    if (!dialogRef.current) {
      return;
    }

    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show]);

  // handle
  const handleBackdrop = () => {
    setShow(false);

    router.push('/schedule');
  };

  const handleKeyboardDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      handleBackdrop();
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" onKeyDownCapture={handleKeyboardDown}>
      <div className="modal-box">
        <h3 className="text-lg font-bold">근무 일정 추가</h3>
        <p className="py-4">Press ESC key or click outside to close</p>
        <div className="modal-action">
          <button className="btn" onClick={handleBackdrop}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
