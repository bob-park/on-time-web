'use client';

import { useEffect, useRef, useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { useUserCompLeaveEntries } from '@/domain/user/query/userCompLeaveEntry';

import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('dayoff.request.comp');

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
      <div className="modal-box bg-base-200 max-w-5xl">
        {/* header */}
        <h3 className="text-base-content text-lg font-bold">{t('modalTitle')}</h3>

        {/* content */}
        <div className="mt-4 flex flex-col items-start justify-center gap-4">
          <p className="text-base-content/70 text-sm">{t('modalDescription')}</p>

          <div className="bg-base-300 w-full overflow-x-auto rounded-lg">
            <table className="table">
              {/* head */}
              <thead>
                <tr className="text-base-content/60">
                  <th className="text-center"></th>
                  <th className="text-center">{t('colCreatedDate')}</th>
                  <th className="text-center">{t('colContents')}</th>
                  <th className="text-center">{t('colLeaveDays')}</th>
                  <th className="text-center">{t('colRemainingDays')}</th>
                </tr>
              </thead>
              <tbody>
                {compLeaveEntries.map((compLeaveEntry) => (
                  <tr key={`select-user-comp-leave-entry-${compLeaveEntry.id}`} className="hover:bg-base-200/60">
                    <td className="text-center">
                      <label>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
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
                    <td className="text-center">{dayjs(compLeaveEntry.effectiveDate).format('YYYY-MM-DD')}</td>
                    <td>{compLeaveEntry.contents}</td>
                    <td className="text-center">{compLeaveEntry.leaveDays}</td>
                    <td className="text-center">{compLeaveEntry.leaveDays - compLeaveEntry.usedDays}</td>
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
          <button className="btn btn-primary" disabled={selectedItems.length === 0} onClick={handleSelect}>
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
