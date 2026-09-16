'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  selectSelectedConnection,
  selectConnections,
} from '@/lib/store/selectors';
import {
  selectConnection,
  removeConnection,
  addConnection,
} from '@/lib/store/slices/drivesSlice';
import { useDriveConnectionDelete } from '@/hooks/useDriveConnection';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  Button,
  Typography,
  Stack,
  Alert,
  AlertTitle,
  Divider,
} from '@mui/material';
import { DriveItem } from './DriveItem';
import { AddDriveDialog } from './AddDriveDialog';
import type { DriveConnectionDto } from '@/lib/generated';
import { createDriveConnectionApi } from '@/hooks/useDriveConnection';

interface DrivesManagementProps {
  onDriveSelect?: (driveId: string) => void;
}

/**
 * ドライブ管理コンポーネント
 */
export function DrivesManagement({ onDriveSelect }: DrivesManagementProps) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const selectedConnection = useAppSelector(selectSelectedConnection);
  const connections = useAppSelector(selectConnections);
  const deleteConnectionMutation = useDriveConnectionDelete();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // OAuth コールバック後にドライブを追加（URLパラメータから)
  useEffect(() => {
    const connectionId = searchParams.get('connectionId');
    const account = searchParams.get('account');
    const provider = searchParams.get('provider');
    const status = searchParams.get('status');
    const connectedAt = searchParams.get('connected_at');

    if (connectionId && account && provider) {
      try {
        const newConnection: DriveConnectionDto = {
          id: connectionId,
          provider,
          account,
          status: (status || 'connected') as 'error' | 'connected' | 'expired' | 'revoked',
          connected_at: connectedAt || new Date().toISOString(),
        };
        dispatch(addConnection(newConnection));
        // URLパラメータをクリア
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('[DrivesManagement] Failed to add connection from URL params:', err);
      }
    }
  }, [searchParams, dispatch]);

  // ドライブを選択
  const handleSelectDrive = (driveId: string) => {
    dispatch(selectConnection(driveId));
    onDriveSelect?.(driveId);
  };

  // ドライブを削除
  const handleDeleteDrive = async (driveId: string) => {
    setIsDeletingId(driveId);
    try {
      setError(null);
      await deleteConnectionMutation.mutateAsync(driveId);
      // API削除成功後、Redux stateから削除
      dispatch(removeConnection(driveId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete drive';
      setError(message);
      console.error('[DrivesManagement] Delete failed:', err);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Google Drive 接続開始
  const handleGoogleClick = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const api = createDriveConnectionApi();
      const result = await api.driveConnectionControllerInitiateConnection('google');

      // OAuth 認可URLにリダイレクト
      if (result.data?.authorize_url) {
        window.location.href = result.data.authorize_url;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google connection failed';
      setError(message);
      setIsLoading(false);
    }
  };

  // Microsoft OneDrive 接続開始
  const handleMicrosoftClick = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const api = createDriveConnectionApi();
      const result = await api.driveConnectionControllerInitiateConnection('onedrive');

      // OAuth 認可URLにリダイレクト
      if (result.data?.authorize_url) {
        window.location.href = result.data.authorize_url;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microsoft connection failed';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            クラウドストレージ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            接続されているクラウドストレージアカウントを管理します。
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          disabled={isLoading}
        >
          + ドライブを追加
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Drives List */}
      <Card sx={{ boxShadow: 2 }}>
        {connections.length === 0 ? (
          <CardContent>
            <Stack spacing={2} sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                クラウドストレージが接続されていません
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Google Drive または Microsoft OneDrive を接続して始めましょう
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setDialogOpen(true)}
                  disabled={isLoading}
                >
                  + ドライブを接続
                </Button>
              </Box>
            </Stack>
          </CardContent>
        ) : (
          <>
            <CardHeader
              title={`接続されているドライブ (${connections.length})`}
              titleTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 600 } }}
            />
            <Divider />
            <CardContent>
              <List sx={{ width: '100%' }}>
                {connections.map((drive, index) => (
                  <React.Fragment key={drive.id}>
                    <DriveItem
                      drive={drive}
                      isSelected={selectedConnection?.id === drive.id}
                      onSelect={handleSelectDrive}
                      onDelete={handleDeleteDrive}
                      isLoading={isDeletingId === drive.id}
                    />
                    {index < connections.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </>
        )}
      </Card>

      {/* Add Drive Dialog */}
      <AddDriveDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onGoogleClick={handleGoogleClick}
        onMicrosoftClick={handleMicrosoftClick}
        isLoading={isLoading}
        error={error}
      />
    </Box>
  );
}