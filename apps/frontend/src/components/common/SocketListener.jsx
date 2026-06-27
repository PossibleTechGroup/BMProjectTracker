'use client';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectData } from '@/store/slices/projectSlice';
import { fetchPlatforms } from '@/store/slices/platformsSlice';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export default function SocketListener() {
  const dispatch = useDispatch();
  const projectId = useSelector(s => s.project.data?.id);
  const currentUser = useSelector(s => s.ui.currentUser);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!currentUser || connectedRef.current) return;
    connectedRef.current = true;

    const socket = connectSocket();

    socket.on('connect', () => {
      console.log('Socket connected for real-time updates');
    });

    socket.on('project:updated', (data) => {
      console.log('Real-time update received:', data);
      dispatch(fetchProjectData());
      if (projectId) {
        dispatch(fetchPlatforms(projectId));
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.off('project:updated');
      socket.off('connect');
      socket.off('disconnect');
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [dispatch, currentUser, projectId]);

  return null;
}
