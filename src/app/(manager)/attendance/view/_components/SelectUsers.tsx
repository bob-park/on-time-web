'use client';

import { useEffect, useState } from 'react';

import Dropdown, { DropdownItem } from '@/shared/components/Dropdown';

import { useGetUsers } from '@/domain/user/query/user';

function mergePageUsers(pages: User[][]) {
  const users: User[] = [];

  for (const page of pages) {
    for (const user of page) {
      users.push(user);
    }
  }

  return users;
}

function displayUsername(user: User) {
  const { team, position } = user;

  return `${user.username} ${team && position ? `(${team.name} - ${position.name})` : ''}`;
}

export default function SelectUsers() {
  // state
  const [selectedUser, setSelectedUser] = useState<User>();
  const [pageParams] = useState<SearchPageParams>({ page: 0, size: 20 });

  // query
  const { pages } = useGetUsers(pageParams);

  const users = mergePageUsers(pages.map((page) => page.content));

  // useEffect
  useEffect(() => {}, []);

  // handle
  const handleChange = (uniqueId?: string) => {
    if (!uniqueId) {
      setSelectedUser(undefined);
      return;
    }

    const user = users.find((user: User) => user.uniqueId === uniqueId);

    user && setSelectedUser(user);
  };

  return (
    <div className="w-72">
      <Dropdown placeholder="선택" text={selectedUser && displayUsername(selectedUser)} onChange={handleChange}>
        {/* default option */}
        <DropdownItem text="없음" active={!selectedUser} />

        {/* users */}
        {users.map((user: User) => (
          <DropdownItem
            key={`dropdown-item-user-${user.uniqueId}`}
            value={user.uniqueId}
            text={displayUsername(user)}
            active={user.uniqueId === selectedUser?.uniqueId}
          />
        ))}
      </Dropdown>
    </div>
  );
}
