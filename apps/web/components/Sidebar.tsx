'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Avatar,
  Divider,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import {
  Home as HomeIcon,
  Folder as FolderIcon,
  Cloud as CloudIcon,
  PlaylistPlay as PlaylistIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

type NavPath = '/' | '/drive' | '/network' | '/playlist' | '/screenshot' | '/download' | '/watched-history' | '/settings';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: NavPath;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'ホーム', icon: <HomeIcon />, path: '/' },
  { label: 'ネットワーク', icon: <FolderIcon />, path: '/network' },
  { label: 'ドライブ', icon: <CloudIcon />, path: '/drive' },
  { label: 'プレイリスト', icon: <PlaylistIcon />, path: '/playlist' },
  { label: 'スクリーンショット', icon: <ImageIcon />, path: '/screenshot' },
  { label: 'ダウンロード', icon: <DownloadIcon />, path: '/download' },
  { label: '視聴履歴', icon: <HistoryIcon />, path: '/watched-history' },
  { label: '設定', icon: <SettingsIcon />, path: '/settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Next.js 用サイドバーコンポーネント
 * MUI Drawer を使用してレスポンシブなサイドバーを実装
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavClick = (path: NavPath) => {
    router.push(path);
    onClose();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('[Sidebar] Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isAuthenticated) return null;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ヘッダー */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Danmaku
        </Typography>

        {/* ユーザープロフィール */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={user.picture_url || undefined}
              alt={user.name}
              sx={{
                width: 48,
                height: 48,
              }}
            >
              {user.name?.[0] || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600 }}
              >
                {user.name || 'ユーザー'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block' }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ナビゲーション */}
      <List sx={{ flex: 1, py: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                cursor: 'pointer',
                backgroundColor: isActive ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'primary.main' : 'text.primary',
                }}
              >
                {item.label}
              </Typography>
            </ListItem>
          );
        })}
      </List>

      {/* フッター */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          ログアウト
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* デスクトップ用: 常時表示サイドバー */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 240,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        {drawerContent}
      </Box>

      {/* モバイル用: Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 240,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
