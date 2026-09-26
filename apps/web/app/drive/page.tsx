'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { useFolderList, useFolderSearch } from '@/hooks/useFolder';
import { useDriveConnections } from '@/hooks/useDriveConnection';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { selectSelectedConnection, selectHydrated } from '@/lib/store/selectors';
import { setConnections, selectConnection } from '@/lib/store/slices/drivesSlice';
import { FolderBreadcrumb } from '@/components/drive/FolderBreadcrumb';
import { FileGridView } from '@/components/drive/FileGridView';
import { FileSearchBar } from '@/components/drive/FileSearchBar';
import { DriveSelector } from '@/components/DriveSelector';
import type { FileItemDto } from '@/lib/generated';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Stack,
  Paper,
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

/**
 * Google Drive Page - MUI Version
 */
export default function DrivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [folderId, setFolderId] = useState('root');
  const [folderName, setFolderName] = useState('My Drive');
  const [searchResults, setSearchResults] = useState<FileItemDto[] | null>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedConnection = useAppSelector(selectSelectedConnection);
  const hydrated = useAppSelector(selectHydrated);

  const { data: connections, isLoading: isConnectionsLoading } = useDriveConnections();

  // URLクエリパラメータを取得
  const connectionIdParam = searchParams?.get('connectionId');
  const folderIdParam = searchParams?.get('folderId');

  // connections を Redux に設定
  useEffect(() => {
    if (connections && connections.length > 0) {
      dispatch(setConnections(connections));
    }
  }, [connections, dispatch]);

  // connectionId を初期化（URLパラメータ優先）
  useEffect(() => {
    if (connectionIdParam) {
      // URLパラメータがある場合、そのconnectionを選択
      dispatch(selectConnection(connectionIdParam));
    } else if (!selectedConnection && connections && connections.length > 0) {
      // selectedConnectionがない場合、最初のconnectionを選択
      dispatch(selectConnection(connections[0].id));
    }
  }, [connectionIdParam, connections, selectedConnection, dispatch]);

  // folderId を初期化（URLパラメータ優先）
  useEffect(() => {
    if (folderIdParam) {
      setFolderId(folderIdParam);
    } else {
      setFolderId('root');
    }
  }, [folderIdParam]);

  const connectionId = selectedConnection?.id || connections?.[0]?.id || '';

  const { data: folderData, isLoading: isFolderLoading } = useFolderList(connectionId, folderId);

  const searchMutation = useFolderSearch(connectionId);


  // フォルダーをクリックしたときの処理
  const handleFolderClick = useCallback(
    (clickedFolderId: string, clickedFolderName?: string) => {
      setFolderId(clickedFolderId);
      setFolderName(clickedFolderName ?? folderName);
      setSearchResults(null);

      // URLにクエリパラメータを付与
      const params = new URLSearchParams();
      if (connectionId) {
        params.append('connectionId', connectionId.toString());
      }
      params.append('folderId', clickedFolderId);

      router.push(`/drive?${params.toString()}`);
    },
    [folderName, connectionId, router],
  );

  const handleSearch = useCallback(
    async (query: string) => {
      try {
        const result = await searchMutation.mutateAsync({
          folderId,
          query,
        });
        setSearchResults(result.items);
      } catch (error) {
        console.error('Search failed:', error);
      }
    },
    [folderId, searchMutation],
  );

  const handleClearSearch = useCallback(() => {
    setSearchResults(null);
  }, []);

  const handleVideoClick = useCallback(
    (fileId: string, fileName: string, folderId?: string) => {
      const params = new URLSearchParams({
        fileId: encodeURIComponent(fileId),
      });
      if (folderId) {
        params.append('folderId', encodeURIComponent(folderId));
      }
      router.push(`/watch?${params.toString()}`);
    },
    [router],
  );

  if (!isAuthenticated) {
    return null;
  }

  const displayItems = searchResults || folderData?.items || [];
  const isLoading = isConnectionsLoading || isFolderLoading || searchMutation.isPending;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile AppBar */}
        <AppBar
          position="static"
          elevation={1}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setSidebarOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ドライブ
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Drive Selector */}
          {connections && connections.length > 1 && (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Drive:
                </Typography>
                <DriveSelector />
              </Box>
            </Paper>
          )}

          {/* Breadcrumb */}
          <Paper sx={{ p: 2 }}>
            <FolderBreadcrumb
              currentFolderId={folderId}
              currentFolderName={folderName}
              onNavigate={handleFolderClick}
            />
          </Paper>

          {/* Search Box */}
          <Card>
            <CardContent>
              <FileSearchBar
                isLoading={searchMutation.isPending}
                onSearch={handleSearch}
                onClear={handleClearSearch}
              />
            </CardContent>
          </Card>

          {/* Error Alert */}
          {searchMutation.isError && (
            <Alert severity="error">
              <AlertTitle>Search Error</AlertTitle>
              Failed to search files. Please try again.
            </Alert>
          )}

          {/* File Grid */}
          <Card>
            <CardContent>
              <FileGridView
                items={displayItems}
                isLoading={isLoading}
                onFolderClick={handleFolderClick}
                onVideoClick={handleVideoClick}
              />
            </CardContent>
          </Card>
          </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}