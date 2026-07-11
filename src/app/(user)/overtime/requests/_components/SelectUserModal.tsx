'use client';

import { useEffect, useRef, useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { useGetUsers } from '@/domain/user/query/user';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

interface SelectedUserModalProps {
  show: boolean;
  onClose?: () => void;
  onSelect?: (user: User) => void;
}

export default function SelectUserModal({ show, onClose, onSelect }: SelectedUserModalProps) {
  const t = useTranslations('overtime.request.modal');

  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // state
  const [selectedUserUniqueId, setSelectedUserUniqueId] = useState<string>();

  // query
  const { pages } = useGetUsers({ page: 0, size: 100 });
  const users = mergePageUsers(pages.map((page) => page.content));

  // useEffect
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (show) {
      setSelectedUserUniqueId(undefined);
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

  const handleSelectUser = () => {
    const selectedUser = users.find((user) => user.id === selectedUserUniqueId);

    if (!selectedUser) {
      return;
    }

    onSelect && onSelect(selectedUser);
    handleClose();
  };

  return (
    <dialog ref={ref} className="modal" onKeyDownCapture={handleKeyboardDown}>
      <div className="modal-box rounded-xl bg-[#252525] shadow-2xl">
        {/* header */}
        <h3 className="text-base-content text-lg font-bold">{t('title')}</h3>

        {/* content */}
        <div className="mt-4 flex flex-col items-start justify-center gap-4 overflow-auto">
          <div className="bg-base-300 w-full overflow-x-auto rounded-lg">
            <table className="table">
              {/* head */}
              <thead>
                <tr className="text-base-content/60">
                  <th className="text-center">{t('colTeam')}</th>
                  <th className="text-center">{t('colPosition')}</th>
                  <th className="text-center">{t('colName')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={`user-item-${user.id}`}
                    className={cx('hover:bg-base-200/60 cursor-pointer', {
                      'bg-base-200': user.id === selectedUserUniqueId,
                    })}
                    onClick={() => setSelectedUserUniqueId(user.id)}
                  >
                    <td className="text-center">{user.group?.name}</td>
                    <td className="text-center">{user.position?.name}</td>
                    <td className="text-center">{user.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleClose}>
            <FaTimes className="size-4" />
            {t('cancel')}
          </button>
          <button className="btn btn-primary" disabled={!selectedUserUniqueId} onClick={handleSelectUser}>
            <FaCheck className="size-4" />
            {t('confirm')}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  );
}

function mergePageUsers(pages: User[][]) {
  const users: User[] = [];

  for (const page of pages) {
    for (const user of page) {
      users.push(user);
    }
  }

  return users;
}
