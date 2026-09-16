'use client';

import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store';
import { useAppDispatch } from '@/lib/store/hooks';
import { setHydrated } from '@/lib/store/slices/drivesSlice';

/**
 * Hydration を処理するコンポーネント
 */
function HydrationHandler({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setHydrated(true));
  }, [dispatch]);

  return <>{children}</>;
}

/**
 * Redux Store Provider
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HydrationHandler>{children}</HydrationHandler>
      </PersistGate>
    </Provider>
  );
}
