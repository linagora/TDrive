import { useEffect, useRef, useState } from 'react';
import WebSocketFactory, { WebsocketEvents } from 'app/features/global/types/websocket-types';
import WebSocketService from 'app/features/global/services/websocket-service';

const useWebSocket = () => {
  const wsRef = useRef<WebSocketService>();
  // having this will allow consumers to be updated with the io instance once connected
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    wsRef.current = WebSocketFactory.get();

    if (wsRef.current.isConnected()) {
      setConnected(() => true);
    }

    wsRef.current.on(WebsocketEvents.Connected, () => {
      setConnected(() => true);
    });

    wsRef.current.on(WebsocketEvents.Disconnected, () => {
      setConnected(() => false);
    });

    return () => undefined;
  }, []);

  return {
    websocket: wsRef.current,
    connected,
  };
};

export default useWebSocket;
