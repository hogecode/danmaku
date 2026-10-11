"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Alert,
  LinearProgress,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
import {
  GetApp as DownloadIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Schedule as QueuedIcon,
} from "@mui/icons-material";
import { useNicovideoDownload } from "@/hooks/useNicovideoDownload";

/**
 * ニコ動ダウンロードコンポーネント
 */
export function NicovideoDownloader() {
  const [videoId, setVideoId] = useState("");
  const [quality, setQuality] = useState<"high" | "low" | "auto">("auto");

  const { jobId, status, progress, result, error, isLoading, startDownload, cancelDownload, reset } =
    useNicovideoDownload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId.trim()) return;

    try {
      await startDownload(videoId.trim(), quality);
      setVideoId("");
    } catch (error) {
      console.error("ダウンロード開始失敗:", error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "queued":
        return <QueuedIcon sx={{ color: "orange" }} />;
      case "completed":
        return <CompleteIcon sx={{ color: "green" }} />;
      case "failed":
        return <ErrorIcon sx={{ color: "red" }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        🎬 ニコ動 ダウンロード
      </Typography>

      {status === "idle" ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="ニコ動 動画ID"
                placeholder="sm12345678"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                disabled={isLoading}
                fullWidth
                helperText="例: sm12345678"
                variant="outlined"
              />

              <Box sx={{ display: "flex", gap: 1 }}>
                {(["auto", "high", "low"] as const).map((q) => (
                  <Button
                    key={q}
                    variant={quality === q ? "contained" : "outlined"}
                    onClick={() => setQuality(q)}
                    disabled={isLoading}
                  >
                    {q === "auto" ? "自動" : q === "high" ? "高画質" : "低画質"}
                  </Button>
                ))}
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="error"
                disabled={!videoId.trim() || isLoading}
                startIcon={<DownloadIcon />}
                sx={{ py: 1.5, fontWeight: "bold" }}
              >
                {isLoading ? "開始中..." : "ダウンロード開始"}
              </Button>
            </Stack>
          </form>
        </Paper>
      ) : null}

      {jobId && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {getStatusIcon()}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Job ID: {jobId}
                  </Typography>
                  <Chip
                    label={status}
                    color={
                      status === "completed"
                        ? "success"
                        : status === "failed"
                          ? "error"
                          : "warning"
                    }
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>

              {progress && (
                <>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">{progress.message}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {progress.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress.percentage}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                </>
              )}

              {(status === "queued" || status === "processing") && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => jobId && cancelDownload(jobId)}
                  fullWidth
                >
                  キャンセル
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>❌ エラー:</strong> {error}
        </Alert>
      )}

      {status === "completed" && result && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>✅ ダウンロード完了</Typography>
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>ファイル名:</strong> {result.fileName}
            </Typography>
            <Typography variant="body2">
              <strong>サイズ:</strong> {(result.fileSize / 1024 / 1024).toFixed(2)} MB
            </Typography>
            <Button
              variant="contained"
              color="success"
              href={result.s3Url}
              target="_blank"
              startIcon={<DownloadIcon />}
              sx={{ mt: 2 }}
            >
              もう一度ダウンロード
            </Button>
            <Button variant="outlined" onClick={() => reset()} sx={{ mt: 1 }}>
              別の動画をダウンロード
            </Button>
          </Stack>
        </Alert>
      )}
    </Box>
  );
}
