'use client';

import { useState } from 'react';

import Dropdown from '@/shared/components/Dropdown';

export default function SelectUsers() {
  // state
  const [selectedUserUniqueId, setSelectedUserUniqueId] = useState<string>();

  return (
    <div className="w-72">
      <Dropdown placeholder="선택"></Dropdown>
    </div>
  );
}
