/**
 * Redux Store（localStorage 永続化付き + Redux DevTools）
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
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
import authReducer from './slices/authSlice';

// ✅ Root Reducer を作成（combineReducers）
const rootReducer = combineReducers({
  drives: drivesReducer,
  auth: authReducer,
});

// ✅ Redux Persist 設定
const persistConfig = {
  key: 'danmaku-web-store',
  storage,
  whitelist: ['drives', 'auth'], // 永続化するスライス
};

// ✅ Root Reducer に persistReducer を適用
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
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
