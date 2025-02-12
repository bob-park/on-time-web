'use client';

import { useState } from 'react';

import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import cx from 'classnames';

export default function SelectUsers() {
  // state
  const [show, setShow] = useState<boolean>(false);

  return (
    <div className="size-full">
      <div className={cx('dropdown w-full', show && 'dropdown-open')}>
        <div
          className="relative flex h-12 w-full flex-row items-center justify-center gap-2 rounded-lg border px-3 py-2"
          onClick={() => setShow(!show)}
        >
          <div className="w-full">
            <span className=""></span>
          </div>
          <div className="absolute right-4">{show ? <IoIosArrowUp /> : <IoIosArrowDown />}</div>
        </div>
      </div>
    </div>
  );
}
