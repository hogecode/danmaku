/**
 * Redux Store（localStorage 永続化付き）
 */

import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage を使用
import drivesReducer from './slices/drivesSlice';

// ✅ Redux Persist 設定
const persistConfig = {
  key: 'danmaku-web-store',
  storage,
  whitelist: ['drives'], // 永続化するスライス
};

const persistedDrivesReducer = persistReducer(persistConfig, drivesReducer);

export const store = configureStore({
  reducer: {
    drives: persistedDrivesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
