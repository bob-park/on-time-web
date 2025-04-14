'use client';

import { useEffect, useState } from 'react';

import { Client, IFrame, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const DEFAULT_WS_HOST = 'http://localhost:8083/api/ws';

export default function SocketContents({ id }: { id: number }) {
  const [wsClient, setWsClient] = useState<Client>();

  // useEffect
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(DEFAULT_WS_HOST),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('connected...');

        client.subscribe(`/sub/room/${id}`, (message: IMessage) => {
          const receiveData = JSON.parse(message.body);

          console.log(receiveData);
        });
      },
      onDisconnect: () => {
        console.log('disconnected...');
      },
    });

    setWsClient(client);
    client.activate();

    return () => {
      client.forceDisconnect();
    };
  }, []);

  // handle
  const handlePush = () => {
    if (!wsClient) {
      return;
    }

    wsClient.publish({
      destination: `/sub/room/${id}`,
      body: JSON.stringify({
        type: 'MESSAGE',
        userUniqueId: 'user1',
        message: 'test',
      }),
    });
  };

  return (
    <div className="">
      <button className="btn btn-neutral" onClick={handlePush}>
        push message
      </button>
    </div>
  );
}
