'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import cx from 'classnames';

interface DropdownProps {
  text?: string;
  placeholder?: string;
  children?: React.ReactNode;
  onChange?: (value?: string) => void;
}

interface DropdownItemProps {
  value?: string;
  text: string;
  active: boolean;
}

interface DropdownContextProps {
  value?: string;
  onChange?: (value?: string) => void;
}

const DropdownContext = createContext<DropdownContextProps>({});

export default function Dropdown({ text, placeholder, children, onChange }: DropdownProps) {
  // state
  const [show, setShow] = useState<boolean>(false);
  const [cxValue, setCxValue] = useState<string>();

  // useEffect
  useEffect(() => {
    handleChange(cxValue);
  }, [cxValue]);

  // memo
  const contextValue = useMemo(
    () => ({
      value: cxValue,
      onChange: (value?: string) => handleChange(value),
    }),
    [cxValue],
  );

  const handleChange = (value?: string) => {
    setCxValue(value);
    setShow(false);
    onChange && onChange(value);
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div className={cx('dropdown w-full select-none', show && 'dropdown-open')}>
        <div
          className="relative flex h-12 w-full cursor-pointer flex-row items-center gap-2 rounded-lg border px-3 py-2"
          onClick={() => setShow(!show)}
        >
          <div className="w-full text-center">
            <span className="">{text || placeholder}</span>
          </div>
          <div className="absolute right-0 pr-2">{show ? <IoIosArrowUp /> : <IoIosArrowDown />}</div>
        </div>
        <ul className="menu dropdown-content z-[1] w-full rounded-box bg-base-100 p-2 shadow">{children}</ul>
      </div>
    </DropdownContext.Provider>
  );
}

export const DropdownItem = ({ value, text, active = false }: DropdownItemProps) => {
  // context
  const { onChange } = useContext(DropdownContext);

  // handle
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    onChange && onChange(value);
  };

  return (
    <li className={cx(active && 'w-full rounded-lg bg-neutral text-white')} onClick={handleClick}>
      <span>{text}</span>
    </li>
  );
};
