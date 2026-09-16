'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/provider/AuthProvider';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { DrivesManagement } from '@/components/DrivesManagement';

/**
 * ドライブ設定ページ
 * 接続済みドライブの管理
 */
export default function DrivesSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthContext();

  // 未認証の場合はログインページへリダイレクト
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <DrivesManagement />
      </Container>
    </Box>
  );
}
