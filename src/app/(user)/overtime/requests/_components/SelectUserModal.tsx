'use client';

import { useEffect, useRef, useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { useGetUsers } from '@/domain/user/query/user';

import cx from 'classnames';

interface SelectedUserModalProps {
  show: boolean;
  onClose?: () => void;
  onSelect?: (user: User) => void;
}

export default function SelectUserModal({ show, onClose, onSelect }: SelectedUserModalProps) {
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
      <div className="modal-box">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">인원 선택</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-start justify-center gap-4 overflow-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th className="text-center font-bold">팀</th>
                <th className="text-center font-bold">직급</th>
                <th className="text-center font-bold">이름</th>
              </tr>
            </thead>
            <tbody className="">
              {users.map((user) => (
                <tr
                  key={`user-item-${user.id}`}
                  className={cx('hover:bg-base-200 hover:cursor-pointer', {
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

        {/* action */}
        <div className="modal-action">
          <button className="btn w-32" onClick={handleClose}>
            <FaTimes className="size-6" />
            안할까?
          </button>
          <button className="btn btn-primary w-32" disabled={!selectedUserUniqueId} onClick={handleSelectUser}>
            <FaCheck className="size-5" />
            선택해?
          </button>
        </div>
      </div>
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
