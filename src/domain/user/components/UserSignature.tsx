'use client';

import { useState } from 'react';

import Image from 'next/image';

interface UserSignatureProps {
  userUniqueId: string;
}

export default function UserSignature({ userUniqueId }: UserSignatureProps) {
  // state
  const [isError, setIsError] = useState<boolean>(false);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-1">
      {!isError && (
        <Image
          src={`/api/users/${userUniqueId}/signature`}
          alt="user signature"
          width={90}
          height={90}
          onError={() => setIsError(true)}
        />
      )}
    </div>
  );
}
