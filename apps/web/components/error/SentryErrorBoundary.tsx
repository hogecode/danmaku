"use client";

import * as Sentry from "@sentry/nextjs";
import { ReactNode } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import HomeIcon from "@mui/icons-material/Home";

interface SentryErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Sentry Error Boundary ラッパーコンポーネント
 * 
 * Sentry 公式の ErrorBoundary を MUI でカスタマイズしたフォールバック UI でラップ
 * 
 * 
 * 用途:
 * - app/layout.tsx のルートレベルで使用
 * - Provider コンポーネントの直下に配置
 */
export function SentryErrorBoundary({ children }: SentryErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallbackUI error={error as Error} onReset={resetError} />
      )}
      beforeCapture={(scope) => {
        scope.setTag("errorType", "react_error");
        scope.setLevel("fatal");
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

/**
 * エラー画面のフォールバック UI
 * MUI を使用してアプリに統一されたスタイリング
 */
interface ErrorFallbackUIProps {
  error: Error;
  onReset: () => void;
}

function ErrorFallbackUI({ error, onReset }: ErrorFallbackUIProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderLeft: "6px solid",
            borderLeftColor: "error.main",
            borderRadius: 2,
          }}
        >
          {/* エラーアイコン */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: "error.main",
              }}
            />
          </Box>

          {/* メインメッセージ */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              textAlign: "center",
              color: "text.primary",
            }}
          >
            エラーが発生しました
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            申し訳ありませんが、予期しない問題が発生しました。
          </Typography>

          {/* エラー詳細（開発環境のみ表示） */}
          {process.env.NODE_ENV === "development" && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                エラー詳細（開発環境）
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  wordBreak: "break-word",
                  p: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  borderRadius: 1,
                }}
              >
                {error instanceof Error ? error.message : String(error)}
              </Typography>
            </Alert>
          )}

          {/* アクションボタン */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onReset}
              fullWidth
              size="large"
            >
              もう一度試す
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={() => (window.location.href = "/")}
              fullWidth
              size="large"
            >
              ホームへ
            </Button>
          </Stack>

          {/* サポート情報 */}
          <Typography
            variant="caption"
            component="div"
            sx={{
              display: "block",
              textAlign: "center",
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            問題が続く場合は、サポートにお問い合わせください。
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
