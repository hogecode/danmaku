'use client';

import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { ProviderIcon } from './icon/ProviderIcon';
import type { DriveConnectionDto } from '@/lib/generated';

interface DriveItemProps {
  drive: DriveConnectionDto;
  isSelected: boolean;
  onSelect: (driveId: string) => void;
  onDelete: (driveId: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * ドライブアイテムコンポーネント
 */
export function DriveItem({
  drive,
  isSelected,
  onSelect,
  onDelete,
  isLoading = false,
}: DriveItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(drive.id);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // プロバイダー表示名
  const getProviderLabel = (provider: string): string => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'Google Drive';
      case 'onedrive':
        return 'Microsoft OneDrive';
      case 'dropbox':
        return 'Dropbox';
      default:
        return provider;
    }
  };

  // 接続日時をフォーマット
  const formatConnectedDate = (connectedAt: string | undefined): string => {
    if (!connectedAt) return 'Unknown';
    try {
      const date = new Date(connectedAt);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <>
      <ListItem
        onClick={() => onSelect(drive.id)}
        sx={{
          mb: 1,
          borderRadius: 1,
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          bgcolor: isSelected ? 'action.selected' : 'background.paper',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'primary.main',
          },
        }}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
            disabled={isDeleting}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        }
      >
        <ListItemAvatar>
          <ProviderIcon provider={drive.provider} size={56} />
        </ListItemAvatar>

        <ListItemText
          primary={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {getProviderLabel(drive.provider)}
              </Typography>
              <Chip
                label={drive.status}
                size="small"
                variant="outlined"
                sx={{ height: 24 }}
              />
              {isSelected && (
                <Chip
                  label="Selected"
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ height: 24 }}
                />
              )}
            </Box>
          }
          secondary={
            <Box sx={{ mt: 0.5 }}>
              <Box sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                Account: {drive.account || 'Unknown'}
                <br />
                Connected: {formatConnectedDate(drive.connected_at)}
                <br />
                ID: {drive.id.substring(0, 16)}...
              </Box>
            </Box>
          }
        />
      </ListItem>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>ドライブ接続の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            本当に <strong>{getProviderLabel(drive.provider)}</strong> への接続を削除してもよろしいですか？ 
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? '削除中...' : '削除'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
