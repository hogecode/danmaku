'use client';

import type { FileItemDto } from '@/lib/generated';
import { FileUtility } from '@/lib/utils/file-utility';
import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Stack,
} from '@mui/material';

/**
 * ファイル/フォルダグリッド表示（MUI版）
 */
interface FileGridViewProps {
  items: FileItemDto[];
  isLoading?: boolean;
  onFolderClick: (folderId: string, folderName: string) => void;
  onVideoClick?: (fileId: string, fileName: string, folderId?: string) => void;
}

export function FileGridView({
  items,
  isLoading = false,
  onFolderClick,
  onVideoClick,
}: FileGridViewProps) {
  if (isLoading && items.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="textSecondary">ファイルがありません</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {items.map((item) => (
        <FileGridItem
          key={item.id}
          item={item}
          onFolderClick={onFolderClick}
          onVideoClick={onVideoClick}
        />
      ))}
    </Stack>
  );
}

/**
 * グリッドアイテム
 */
interface FileGridItemProps {
  item: FileItemDto;
  onFolderClick: (folderId: string, folderName: string) => void;
  onVideoClick?: (fileId: string, fileName: string, folderId?: string) => void;
}

function FileGridItem({
  item,
  onFolderClick,
  onVideoClick,
}: FileGridItemProps) {
  const isFolder = FileUtility.isFolder(item.mimeType);
  const isVideo = FileUtility.isVideo(item.mimeType);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (isFolder) {
      onFolderClick(item.id, item.name);
    } else if (isVideo && onVideoClick) {
      onVideoClick(item.id, item.name, item.parentId);
    }
  };

  const isClickable = isFolder || (isVideo && onVideoClick);

  return (
    <Card
      onClick={handleClick}
      sx={{
        display: 'flex',
        gap: 2,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': isClickable
          ? {
              boxShadow: 2,
              bgcolor: 'action.hover',
            }
          : {},
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* ✅ サムネイル部分（左側） */}
      <Box
        sx={{
          position: 'relative',
          width: 160,
          height: 90,
          minWidth: 100,
          backgroundColor: 'grey.100',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isVideo && item.thumbnailLink && !imageError ? (
          <Box
            component="img"
            src={item.thumbnailLink}
            alt={item.name}
            onError={() => setImageError(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              fontSize: '2.5rem',
            }}
          >
            {FileUtility.getFileIcon(item.mimeType)}
          </Box>
        )}
      </Box>

      {/* ✅ ファイル情報部分（右側） */}
      <CardContent sx={{ flex: 1, py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            mb: 0.5,
          }}
        >
          {item.name}
        </Typography>

        {/* ✅ メタ情報 */}
        {isVideo && (
          <Typography variant="caption" color="textSecondary">
            {item.size ? FileUtility.formatFileSize(item.size) : '-'}
          </Typography>
        )}

        {isFolder && (
          <Typography variant="caption" color="textSecondary">
            フォルダ
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
