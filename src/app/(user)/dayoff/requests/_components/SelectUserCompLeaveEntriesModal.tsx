'use client';

import { useEffect, useRef, useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { useUserCompLeaveEntries } from '@/domain/user/query/userCompLeaveEntry';

import dayjs from 'dayjs';

interface SelectUserCompLeaveEntriesModalProps {
  show: boolean;
  onClose?: () => void;
  onSelect?: (items: UsedCompLeaveEntryRequest[]) => void;
}

export default function SelectUserCompLeaveEntriesModal({
  show,
  onClose,
  onSelect,
}: SelectUserCompLeaveEntriesModalProps) {
  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // state
  const [selectedItems, setSelectedItems] = useState<UsedCompLeaveEntryRequest[]>([]);

  // query
  const { compLeaveEntries } = useUserCompLeaveEntries();

  // useEffect
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (show) {
      setSelectedItems([]);

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

  const handleSelect = () => {
    selectedItems && onSelect && onSelect(selectedItems);
    handleClose();
  };

  return (
    <dialog ref={ref} className="modal" onKeyDownCapture={handleKeyboardDown}>
      <div className="modal-box max-w-5xl">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">보상 휴가 선택</h3>
          </div>
        </div>

        {/* content */}
        <div className="m-3 flex flex-col items-start justify-center gap-4">
          <p className="text-base">보상 휴가를 선택해야 신청할 수 있지 않을까?</p>

          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th className="text-center">
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>
                <th className="text-center">보상 휴가 생성일</th>
                <th className="text-center">내용</th>
                <th className="text-center">보상 휴가일</th>
                <th className="text-center">잔여 휴가일</th>
              </tr>
            </thead>
            <tbody>
              {compLeaveEntries.map((compLeaveEntry) => (
                <tr key={`select-user-comp-leave-entry-${compLeaveEntry.id}`} className="">
                  <td className="text-center">
                    <label>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedItems.some((item) => item.compLeaveEntryId === compLeaveEntry.id)}
                        onChange={(e) => {
                          setSelectedItems((prev) => {
                            const newSelectedItems = prev.slice();

                            if (e.target.checked) {
                              newSelectedItems.push({
                                compLeaveEntryId: compLeaveEntry.id,
                                usedDays: compLeaveEntry.usedDays,
                              });
                            } else {
                              const index = newSelectedItems.findIndex(
                                (item) => item.compLeaveEntryId === compLeaveEntry.id,
                              );

                              index >= 0 && newSelectedItems.splice(index, 1);
                            }

                            return newSelectedItems;
                          });
                        }}
                      />
                    </label>
                  </td>
                  <td>{dayjs(compLeaveEntry.effectiveDate).format('YYYY-MM-DD')}</td>
                  <td>{compLeaveEntry.contents}</td>
                  <td className="text-center">{compLeaveEntry.leaveDays}</td>
                  <td className="text-center">{compLeaveEntry.leaveDays - compLeaveEntry.usedDays}</td>
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
          <button className="btn btn-primary w-32" disabled={selectedItems.length === 0} onClick={handleSelect}>
            <FaCheck className="size-5" />
            할까?
          </button>
        </div>
      </div>
    </dialog>
  );
}
