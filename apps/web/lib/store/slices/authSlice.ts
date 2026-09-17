'use client';

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { AuthApi, Configuration } from '@/lib/generated';
import type { UserInfoDto } from '@/lib/generated';

/**
 * 認証状態の型定義
 */
export interface AuthState {
  user: UserInfoDto | null;
  loading: boolean;
  loginLoading: boolean;
  logoutLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * 初期状態
 */
const initialState: AuthState = {
  user: null,
  loading: false,
  loginLoading: false,
  logoutLoading: false,
  error: null,
  isAuthenticated: false,
};

/**
 * AuthApi インスタンスを作成
 */
function createAuthApi(): AuthApi {
  const configuration = new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    baseOptions: {
      withCredentials: true,
    },
  });
  return new AuthApi(configuration);
}

/**
 * ✅ ユーザー情報を取得する AsyncThunk
 */
export const fetchUserInfo = createAsyncThunk(
  'auth/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const authApi = createAuthApi();
      const response = await authApi.authControllerGetUserInfo();
      return response.data;
    } catch (error) {
      console.error('[authSlice] Fetch user info error:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('ユーザー情報取得に失敗しました');
    }
  }
);

/**
 * ✅ ログイン開始 AsyncThunk
 */
export const loginWithProvider = createAsyncThunk(
  'auth/loginWithProvider',
  async (provider: string, { rejectWithValue }) => {
    try {
      const authApi = createAuthApi();
      const response = await authApi.authControllerLoginWithProvider(provider);
      return response.data;
    } catch (error) {
      console.error('[authSlice] Login error:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('ログインに失敗しました');
    }
  }
);

/**
 * ✅ ログアウト AsyncThunk
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const authApi = createAuthApi();
      await authApi.authControllerLogout();
      return null;
    } catch (error) {
      console.error('[authSlice] Logout error:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('ログアウトに失敗しました');
    }
  }
);

/**
 * ✅ 認証 Slice
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * ✅ エラーをクリア
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * ✅ 認証状態をリセット
     */
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.loginLoading = false;
      state.logoutLoading = false;
    },
  },
  extraReducers: (builder) => {
    // ✅ fetchUserInfo
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // ✅ loginWithProvider
    builder
      .addCase(loginWithProvider.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginWithProvider.fulfilled, (state, action) => {
        state.loginLoading = false;
        // action.payload.authorize_url にリダイレクト（コンポーネント側で処理）
        state.error = null;
      })
      .addCase(loginWithProvider.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload as string;
      });

    // ✅ logout
    builder
      .addCase(logout.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.logoutLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
