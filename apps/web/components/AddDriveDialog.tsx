'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  AlertTitle,
  Divider,
  Box,
} from '@mui/material';
import { GoogleButton } from './button/GoogleButton';
import { MicrosoftButton } from './button/MicrosoftButton';

interface AddDriveDialogProps {
  open: boolean;
  onClose: () => void;
  onGoogleClick: () => Promise<void>;
  onMicrosoftClick: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * ドライブ追加ダイアログコンポーネント
 */
export function AddDriveDialog({
  open,
  onClose,
  onGoogleClick,
  onMicrosoftClick,
  isLoading = false,
  error = null,
}: AddDriveDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleGoogleClick = async () => {
    try {
      setSelectedProvider('google');
      setIsAuthLoading(true);
      await onGoogleClick();
    } finally {
      setIsAuthLoading(false);
      setSelectedProvider(null);
    }
  };

  const handleMicrosoftClick = async () => {
    try {
      setSelectedProvider('onedrive');
      setIsAuthLoading(true);
      await onMicrosoftClick();
    } finally {
      setIsAuthLoading(false);
      setSelectedProvider(null);
    }
  };

  const handleClose = () => {
    if (!isAuthLoading && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
        クラウドストレージを接続
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Instructions */}
          <Typography variant="body2" color="text.secondary">
            クラウドストレージアカウントを接続して使用を開始します。 
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error">
              <AlertTitle>接続エラー</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Provider Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <GoogleButton
              onPress={handleGoogleClick}
              disabled={isAuthLoading || isLoading}
              loading={selectedProvider === 'google' && (isAuthLoading || isLoading)}
              label="Google Drive を接続"
            />
            <MicrosoftButton
              onPress={handleMicrosoftClick}
              disabled={isAuthLoading || isLoading}
              loading={selectedProvider === 'onedrive' && (isAuthLoading || isLoading)}
              label="Microsoft OneDrive を接続"
            />
          </Box>

          <Divider />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isAuthLoading || isLoading}>
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  );
}
