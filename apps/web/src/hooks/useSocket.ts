import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.store';

export function useSocket(namespace: string) {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(namespace, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [namespace, accessToken]);

  return socketRef.current;
}
