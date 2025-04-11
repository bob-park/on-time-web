'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useGetUsers } from '@/domain/user/query/user';

import Dropdown, { DropdownItem } from '@/shared/components/Dropdown';

interface SelectUserContextValue {
  selectedUser?: User;
  onChange: (user?: User) => void;
}

export const SelectUserContext = createContext<SelectUserContextValue>({ onChange: () => {} });

export function SelectUserContextProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [selectedUser, setSelectedUser] = useState<User>();

  // memo
  const contextValue = useMemo<SelectUserContextValue>(
    () => ({
      selectedUser,
      onChange: (user) => setSelectedUser(user),
    }),
    [selectedUser],
  );

  return <SelectUserContext.Provider value={contextValue}>{children}</SelectUserContext.Provider>;
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

const DisplayUsername = ({ user }: { user: User }) => {
  const { team, position } = user;

  return (
    <div className="text-base">
      {team && <span className="pr-1">{team.name} - </span>}
      <span className="font-semibold">{user.username}</span>
      {position && <span className="pl-1 text-sm text-gray-500">{position.name}</span>}
    </div>
  );
};

export default function SelectUsers() {
  // context
  const { selectedUser, onChange: onChangeSelectUser } = useContext<SelectUserContextValue>(SelectUserContext);

  // state
  // const [selectedUser, setSelectedUser] = useState<User>();

  const [pageParams] = useState<SearchPageParams>({ page: 0, size: 100 });

  // query
  const { pages } = useGetUsers(pageParams);

  const users = mergePageUsers(pages.map((page) => page.content));

  // useEffect
  useEffect(() => {}, []);

  // handle
  const handleChange = (uniqueId?: string) => {
    if (!uniqueId) {
      onChangeSelectUser(undefined);
      return;
    }

    const user = users.find((user: User) => user.uniqueId === uniqueId);

    user && onChangeSelectUser(user);
  };

  return (
    <div className="w-72">
      <Dropdown
        placeholder="선택"
        text={selectedUser && <DisplayUsername user={selectedUser} />}
        onChange={handleChange}
      >
        {/* default option */}
        <DropdownItem text={<div className="text-base">없음</div>} active={!selectedUser} />

        {/* users */}
        {users.map((user: User) => (
          <DropdownItem
            key={`dropdown-item-user-${user.uniqueId}`}
            value={user.uniqueId}
            text={<DisplayUsername user={user} />}
            active={user.uniqueId === selectedUser?.uniqueId}
          />
        ))}
      </Dropdown>
    </div>
  );
}
