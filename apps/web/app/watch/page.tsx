"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  IconButton,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import { VideoPlayer } from "@/components/VideoPlayer";
import type { VideoPlayerHandle } from "@/components/VideoPlayer";
import { CommentImporterModal } from "@/components/CommentImporterModal";
import { useAppSelector } from "@/lib/store/hooks";
import { selectSelectedConnectionId } from "@/lib/store/selectors";
import { useUserSettingsQuery } from "@/hooks/useUserSettings";
import type { DPlayerCommentDto } from "@/lib/generated";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * コメント重複排除
 * なぜか、ニコ動のコメントを取得すると、重複してコメントが含まれることがあるため
 * time と text が同一のコメントを除外
 */
function deduplicateComments(
  comments: DPlayerCommentDto[],
): DPlayerCommentDto[] {
  const seen = new Set<string>();
  const result: DPlayerCommentDto[] = [];

  for (const comment of comments) {
    // time と text を組み合わせてキーを生成
    const key = `${comment.time}:${comment.text}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(comment);
    }
  }

  return result;
}

export default function WatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  // ✅ Redux ストアから選択中のドライブ接続ID を取得
  const connectionId = useAppSelector(selectSelectedConnectionId);

  // ✅ ユーザー設定を取得
  const { data: userSettings, isLoading: settingsLoading } =
    useUserSettingsQuery();

  // ✅ useSearchParams() で query parameters を取得
  const fileId = searchParams.get("fileId");
  const folderId = searchParams.get("folderId") || undefined;

  // ✅ ニコ動コメント状態
  const [nicovideoComments, setNicovideoComments] = useState<
    DPlayerCommentDto[]
  >([]);
  const [importSuccess, setImportSuccess] = useState(false);

  // ✅ モーダル状態
  const [isCommentImporterModalOpen, setIsCommentImporterModalOpen] =
    useState(false);

  /**
   * コメントをインポート
   *
   * ニコ動 / 過去ログの両方で使用
   * initialComments prop を変更すると、VideoPlayer が自動的に
   * DPlayer を再初期化してコメントをリロードする
   */
  const handleCommentsImported = (
    comments: DPlayerCommentDto[],
    mergeMode: boolean,
  ) => {
    // コメント状態を更新 → VideoPlayer に渡される initialComments が変更される
    const mergedComments = mergeMode
      ? [...nicovideoComments, ...comments]
      : comments;

    // ✅ 重複コメントを排除
    const dedupedComments = deduplicateComments(mergedComments);

    setNicovideoComments(dedupedComments);
    setImportSuccess(true);

    setTimeout(() => {
      setImportSuccess(false);
    }, 3000);
  };

  const commentSettings = userSettings
    ? {
        speedRate: 1,
        fontSize: 25,
        opacity: 0.7,
        maxCount: userSettings.danmaku_max_count || 100,
        displayDuration: 5,
        closeFormAfterSend: false,
      }
    : {
        speedRate: 1,
        fontSize: 25,
        opacity: 0.7,
        maxCount: 100,
        displayDuration: 5,
        closeFormAfterSend: false,
      };

  const playerSettings = userSettings
    ? {
        theme: userSettings.theme || "#E64F97",
        autoplay: true,
      }
    : {
        theme: "#E64F97",
        autoplay: true,
      };

  if (authLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          bgcolor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2, color: "inherit" }} />
          <Typography>認証中...</Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) return null;

  if (!fileId) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          bgcolor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
            ファイルが指定されていません
          </Typography>
          <Typography sx={{ color: "gray" }}>
            /watch?fileId=abc123def456
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!connectionId) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          bgcolor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
            ドライブが選択されていません
          </Typography>
          <Typography sx={{ color: "gray" }}>
            ドライブを選択してから動画を再生してください
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: 'gray',
        position: "relative",
      }}
    >
      {/* 左上の戻るボタン */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={() => router.back()}
          sx={{
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            },
          }}
          title="戻る"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* 動画プレイヤー - 画面中央に配置 */}
      <Box
        sx={{
          mb: 4,
          borderRadius: 1,
          overflow: "hidden",
          boxShadow: 3,
          width: "100%",
          maxWidth: "95vw",
          aspectRatio: "16 / 9",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {settingsLoading ? (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress sx={{ mb: 2, color: "inherit" }} />
              <Typography>設定を読込中...</Typography>
            </Box>
          </Box>
        ) : (
          <VideoPlayer
            ref={videoPlayerRef}
            videoFileId={fileId}
            folderId={folderId}
            connectionId={connectionId}
            containerClassName="w-full aspect-video"
            initialComments={nicovideoComments}
            commentSettings={commentSettings}
            playerSettings={playerSettings}
          />
        )}
      </Box>

      {/* コントロール - 動画下部に集約 */}
      <Container maxWidth="lg" sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h6">コメントをインポートする</Typography>
          <IconButton
            onClick={() => setIsCommentImporterModalOpen(true)}
            title="コメント インポーター"
          >
            <Image
              src="/photos/logo/niconico.png"
              alt="ニコニコ動画"
              width={32}
              height={32}
            />
          </IconButton>
        </Box>

        <CommentImporterModal
          isOpen={isCommentImporterModalOpen}
          onClose={() => setIsCommentImporterModalOpen(false)}
          onCommentsImported={handleCommentsImported}
          isDisabled={settingsLoading}
        />

        {importSuccess && (
          <Alert severity="success" sx={{ mt: 4 }}>
            <strong>✅ コメント取得成功</strong>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {nicovideoComments.length} 件のコメントをインポートしました
            </Typography>
          </Alert>
        )}
      </Container>
    </Box>
  );
}
