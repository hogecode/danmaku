"use client";

import { useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNicovideoComments } from "@/hooks/useNicovideoComments";
import type { DPlayerCommentDto } from "@/lib/generated/models";

interface NicovideoCommentImporterProps {
  onCommentsImported: (
    comments: DPlayerCommentDto[],
    mergeMode: boolean,
  ) => void;
  isDisabled?: boolean;
  isModalContent?: boolean; // モーダル内での表示かどうか（スタイル調整用）
}

/**
 * ニコ動コメントインポーター
 * ニコ動動画ID入力 → API 呼び出し → コメント取得 → DPlayer に注入
 */
export function NicovideoCommentImporter({
  onCommentsImported,
  isDisabled = false,
  isModalContent = false,
}: NicovideoCommentImporterProps) {
  const [videoId, setVideoId] = useState("");
  const [mergeMode, setMergeMode] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const { mutate, isPending, error } = useNicovideoComments();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoId.trim()) return;

    mutate(
      { videoId: videoId.trim() },
      {
        onSuccess: (response) => {
          const allComments: DPlayerCommentDto[] = [];

          // タイトルを抽出（あれば）
          if (response.data?.title) {
            setVideoTitle(response.data.title);
          }

          if (response.comments?.threads) {
            response.comments.threads.forEach((thread) => {
              if (thread.comments && Array.isArray(thread.comments)) {
                allComments.push(...(thread.comments as DPlayerCommentDto[]));
              }
            });
          }

          onCommentsImported(allComments, mergeMode);
          setVideoId(""); // フォームをリセット
        },
      },
    );
  };

  return (
    <Box
      sx={
        isModalContent
          ? {}
          : { backgroundColor: "#424242", borderRadius: 1, p: 3, mt: 3 }
      }
    >
      {!isModalContent && (
        <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
          🎬 ニコ動コメント インポート
        </Typography>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TextField
          id="nicoVideoId"
          placeholder="sm12345678"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          disabled={isPending || isDisabled}
          fullWidth
          label="動画ID"
          helperText="例: sm12345678"
          variant="outlined"
        />

        {videoTitle && (
          <Alert severity="success">
            <strong>📹 タイトル:</strong> {videoTitle}
          </Alert>
        )}

        <Paper sx={{ p: 2}}>
          <FormControlLabel
            control={
              <Checkbox
                checked={mergeMode}
                onChange={(e) => setMergeMode(e.target.checked)}
                disabled={isPending || isDisabled}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  既存コメントに<strong>追加</strong>する
                </Typography>
              </Box>
            }
          />
        </Paper>

        <Button
          type="submit"
          variant="contained"
          color="error"
          disabled={!videoId.trim() || isPending || isDisabled}
          fullWidth
          sx={{ py: 1.5, fontWeight: "bold", backgroundColor: "#E64F97" }}
        >
          {isPending ? "⏳ コメント取得中..." : "コメント取得"}
        </Button>

        {error && (
          <Alert severity="error">
            <strong>❌ エラー:</strong> {error.message}
          </Alert>
        )}
      </Box>
    </Box>
  );
}
