'use client';

import { useEffect, useState } from 'react';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketProps {
  host: string;
  publish?: string;
  subscribe?: string;
  onConnect?: () => void;
  onPublish?: (req: ChatMessageRequest) => void;
  onSubscribe?: (data: string) => void;
  onClose?: () => void;
}

export default function useWebSocket({ host, publish, subscribe, onConnect, onSubscribe, onClose }: WebSocketProps) {
  // state
  const [client, setClient] = useState<Client>();

  // useEffect
  useEffect(() => {
    const wsClient = new Client({
      webSocketFactory: () => new SockJS(host),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('connected...');

        subscribe &&
          wsClient.subscribe(subscribe, (message) => {
            onSubscribe && onSubscribe(message.body);
          });
      },
      onDisconnect: () => {
        console.log('disconnected...');
      },
    });

    setClient(wsClient);
    wsClient.activate();

    onConnect && onConnect();

    return () => {
      onClose && onClose();

      wsClient.deactivate();
    };
  }, []);

  // handle
  const handlePush = (data: ChatMessageRequest) => {
    if (!client) {
      return;
    }

    publish && client.publish({ destination: publish, body: JSON.stringify(data) });
  };

  return { publish: handlePush };
}
