/**
 * ファイルタイプアイコンコンポーネント
 */
interface FileTypeIconProps {
  mimeType: string;
  className?: string;
}

export function FileTypeIcon({ mimeType, className = 'w-6 h-6' }: FileTypeIconProps) {
  if (mimeType === 'application/vnd.google-apps.folder') {
    return <span className={`${className} text-blue-500`}>📁</span>;
  }

  if (mimeType === 'video/mp4') {
    return <span className={`${className} text-red-500`}>🎬</span>;
  }

  return <span className={`${className} text-gray-500`}>📄</span>;
}
