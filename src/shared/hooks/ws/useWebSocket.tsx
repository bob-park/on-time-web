'use client';

import { useEffect, useState } from 'react';

import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketProps {
  host: string;
  auth?: {
    userUniqueId: string;
  };
  publish?: string;
  subscribe?: string;
  onConnect?: () => void;
  onPublish?: (req: ChatMessageRequest) => void;
  onSubscribe?: (data: string) => void;
  onClose?: () => void;
}

export default function useWebSocket({
  host,
  auth,
  publish,
  subscribe,
  onConnect,
  onSubscribe,
  onClose,
}: WebSocketProps) {
  // state
  const [client, setClient] = useState<Client>();

  // useEffect
  useEffect(() => {
    let subscription: StompSubscription | null = null;

    const wsClient = new Client({
      webSocketFactory: () => new SockJS(host),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        if (subscribe) {
          subscription = wsClient.subscribe(
            subscribe,
            (message) => {
              onSubscribe && onSubscribe(message.body);
            },
            {
              userUniqueId: auth?.userUniqueId || '',
            },
          );
        }
      },
      onDisconnect: () => {},
    });

    setClient(wsClient);
    wsClient.activate();

    onConnect && onConnect();

    return () => {
      subscription &&
        subscription.unsubscribe({ destination: subscribe || '', userUniqueId: auth?.userUniqueId || '' });

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
