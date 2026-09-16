/**
 * クラウドストレージプロバイダーアイコンコンポーネント
 * Google Drive、Microsoft OneDrive、Dropboxの公式ロゴを使用
 */

import React from 'react';
import { Avatar, Box } from '@mui/material';

interface ProviderIconProps {
  provider: string;
  size?: number;
  showBackground?: boolean;
}

/**
 * Google Drive ロゴ SVG コンポーネント
 * RN版GoogleButton.tsxと同じロゴを使用
 */
function GoogleLogoSVG() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%">
      {/* Red Path */}
      <path
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        fill="#EA4335"
      />
      {/* Blue Path */}
      <path
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        fill="#4285F4"
      />
      {/* Yellow Path */}
      <path
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        fill="#FBBC05"
      />
      {/* Green Path */}
      <path
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        fill="#34A853"
      />
    </svg>
  );
}

/**
 * Microsoft OneDrive ロゴ SVG コンポーネント
 */
function OnedriveLogoSVG() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%">
      <rect x="8" y="12" width="8" height="8" fill="#0078D4" />
      <rect x="18" y="8" width="8" height="8" fill="#50E6FF" />
      <rect x="28" y="12" width="8" height="8" fill="#0063B1" />
      <rect x="8" y="22" width="8" height="8" fill="#106EBE" />
      <rect x="18" y="18" width="8" height="8" fill="#107C10" />
      <rect x="28" y="22" width="8" height="8" fill="#0078D4" />
      <rect x="18" y="28" width="8" height="8" fill="#0078D4" />
    </svg>
  );
}

/**
 * Dropbox ロゴ SVG コンポーネント
 */
function DropboxLogoSVG() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%">
      <polygon
        points="24,2 12,10 12,18 24,26 36,18 36,10"
        fill="#0061FF"
      />
      <polygon
        points="12,30 24,38 36,30 36,22 24,30 12,22"
        fill="#0061FF"
      />
      <polygon points="12,42 24,50 36,42 24,34" fill="#0061FF" />
    </svg>
  );
}

/**
 * Generic Cloud ロゴ SVG コンポーネント
 */
function CloudLogoSVG() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%">
      <path
        d="M36 28c2.21 0 4-1.79 4-4s-1.79-4-4-4h-.5C34.79 16.79 33 14.21 33 12c0-3.31 2.69-6 6-6s6 2.69 6 6c0 .55.45 1 1 1s1-.45 1-1c0-4.42-3.58-8-8-8-3.72 0-6.85 2.56-7.73 6-1.1-.22-2.16-.34-3.27-.34-5.79 0-10.48 4.69-10.48 10.48 0 1.45.29 2.84.83 4.1C14.5 23.65 11 27.5 11 32c0 5.52 4.48 10 10 10h15z"
        fill="#9E9E9E"
      />
    </svg>
  );
}

/**
 * プロバイダーのロゴSVGコンポーネントを返す
 */
function getProviderLogo(provider: string): React.ReactNode {
  switch (provider.toLowerCase()) {
    case 'google':
      return <GoogleLogoSVG />;
    case 'onedrive':
      return <OnedriveLogoSVG />;
    case 'dropbox':
      return <DropboxLogoSVG />;
    default:
      return <CloudLogoSVG />;
  }
}

/**
 * プロバイダーアイコンコンポーネント
 * 公式のプロバイダーロゴをSVGで表示
 */
export function ProviderIcon({
  provider,
  size = 56,
  showBackground = true,
}: ProviderIconProps) {
  // プロバイダー別の背景色
  const getBackgroundColor = (provider: string): string => {
    switch (provider.toLowerCase()) {
      case 'google':
        return '#F3F3F3';
      case 'onedrive':
        return '#F3F3F3';
      case 'dropbox':
        return '#F3F3F3';
      default:
        return '#E8E8E8';
    }
  };

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: showBackground ? getBackgroundColor(provider) : 'transparent',
        border: showBackground ? '1px solid #E0E0E0' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getProviderLogo(provider)}
      </Box>
    </Avatar>
  );
}
