'use client';

import { useGetCurrentUser } from '@/domain/user/query/user';

import useWebSocket from '@/shared/hooks/ws/useWebSocket';

export default function SocketContents({ wsHost, userUniqueId }: { wsHost: string; userUniqueId: string }) {
  // query
  const { currentUser } = useGetCurrentUser();

  // hooks
  const { publish } = useWebSocket({
    host: wsHost,
    subscribe: `/sub/users/${userUniqueId}/chat`,
    publish: `/pub/users/${currentUser?.uniqueId}/chat`,
    onConnect: () => {},
    onClose: () => {},
    onSubscribe: (data) => {
      const res = JSON.parse(data);

      console.log(res);
    },
  });

  // handle
  const handleClick = () => {
    publish({
      type: 'MESSAGE',
      message: '뭐여 쒸벌?',
    });
  };

  return (
    <div className="">
      <button className="btn btn-neutral" onClick={handleClick}>
        push message
      </button>
    </div>
  );
}
