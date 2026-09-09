/**
 * インデックス（リダイレクト）
 */

import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const auth = useAuth();

  useEffect(() => {
    // 認証状態に基づいてリダイレクト
    if (auth.isAuthenticated) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [auth.isAuthenticated]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#1976d2" />
    </View>
  );
}