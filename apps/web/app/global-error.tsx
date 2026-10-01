"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Box, Container, Paper, Typography, Button, Stack } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import HomeIcon from "@mui/icons-material/Home";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // ルートレベルのエラーを Sentry に送信
    Sentry.captureException(error, {
      tags: {
        errorType: "root_error",
      },
      contexts: {
        react: {
          componentStack: error.stack,
        },
      },
      level: "fatal",
    });

    console.error("[Root Error]", error);
  }, [error]);

  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>
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
                重大なエラーが発生しました
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                申し訳ございません。アプリケーションが正常に機能していません。
              </Typography>

              {/* エラー詳細（開発環境のみ表示） */}
              {process.env.NODE_ENV === "development" && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    backgroundColor: "#ffebee",
                    border: "1px solid #ef5350",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: "#c62828",
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
                      color: "#c62828",
                      mb: 1,
                    }}
                  >
                    {error.message}
                  </Typography>
                  {error.digest && (
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "#c62828" }}
                    >
                      <strong>Error ID:</strong> {error.digest}
                    </Typography>
                  )}
                </Box>
              )}

              {/* アクションボタン */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.reload()}
                  fullWidth
                  size="large"
                >
                  ページをリロード
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
                sx={{
                  display: "block",
                  textAlign: "center",
                  color: "text.secondary",
                  mt: 3,
                  fontStyle: "italic",
                }}
              >
                問題が続く場合は、サポートにお問い合わせください。
              </Typography>
            </Paper>
          </Container>
        </Box>
      </body>
    </html>
  );
}