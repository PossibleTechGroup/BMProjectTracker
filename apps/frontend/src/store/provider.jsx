'use client';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { fetchMe } from './slices/uiSlice';
import SocketListener from '@/components/common/SocketListener';

function AuthInit({ children }) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(fetchMe());
    }
  }, []);
  return children;
}

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthInit>
        <SocketListener />
        {children}
      </AuthInit>
    </Provider>
  );
}
