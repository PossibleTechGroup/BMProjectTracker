'use client';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectData } from '@/store/slices/projectSlice';
import { fetchPlatforms } from '@/store/slices/platformsSlice';
import { fetchReviews } from '@/store/slices/reviewsSlice';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export default function SocketListener() {
  const dispatch = useDispatch();
  const projectId = useSelector(s => s.project.data?.id);
  const currentUser = useSelector(s => s.ui.currentUser);
  const connectedRef = useRef(false);
  const projectIdRef = useRef(projectId);

  projectIdRef.current = projectId;

  useEffect(() => {
    if (!currentUser) return;

    if (!connectedRef.current) {
      connectedRef.current = true;
      const socket = connectSocket();

      socket.on('connect', () => {
        console.log('Socket connected for real-time updates');
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      socket.on('project:updated', () => {
        console.log('Real-time update received, refetching data');
        dispatch(fetchProjectData());
        dispatch(fetchPlatforms(projectIdRef.current));
      });

      socket.on('reviews:cleared', ({ entityKey }) => {
        console.log('Reviews cleared for', entityKey, '- refetching');
        dispatch(fetchReviews(entityKey));
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
    }

    return () => {
      // Keep socket alive across re-renders
    };
  }, [dispatch, currentUser]);

  return null;
}
