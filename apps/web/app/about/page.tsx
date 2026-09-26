"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Avatar,
  Divider,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { PlayArrow, Comment, Cloud } from "@mui/icons-material";

export default function AboutPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted)
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
            🎬 Danmaku
          </Typography>
          <Button color="inherit" onClick={() => router.push("/auth/login")}>
            ログイン
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, bgcolor: "background.default", py: 4 }}>
        <Container maxWidth="md">
          <Stack spacing={4}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardContent sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  Danmaku Video Player
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 300, mt: 1, mb: 3 }}>
                  クラウドストレージの動画を弾幕付きで視聴
                </Typography>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "white", color: "#667eea", fontWeight: 700 }}
                  size="large"
                  onClick={() => router.push("/auth/login")}
                >
                  今すぐ始める
                </Button>
              </CardContent>
            </Card>
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 3,
                  border: "1px solid #e0e0e0",
                  borderLeft: "4px solid #667eea",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Cloud sx={{ fontSize: 40, color: "#667eea" }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      クラウド対応
                    </Typography>
                    <Typography variant="body2">
                      Google Drive / OneDrive からストリーミング再生
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  p: 3,
                  border: "1px solid #e0e0e0",
                  borderLeft: "4px solid #764ba2",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Comment sx={{ fontSize: 40, color: "#764ba2" }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      弾幕コメント
                    </Typography>
                    <Typography variant="body2">
                      ニコニコ動画、実況のコメントのリアルタイム表示
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Stack>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                📖 使い方
              </Typography>
              <Stack spacing={3}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 3,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: "#667eea",
                            color: "white",
                            fontWeight: 700,
                            width: 48,
                            height: 48,
                          }}
                        >
                          1
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            ドライブ追加
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Google Drive や OneDriveを追加。<br />複数ドライブを管理できます。
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: "#f5f5f5",
                          borderRadius: 1,
                          position: "relative",
                          aspectRatio: "16/9",
                          width: "100%",
                        }}
                      >
                        <Image
                          src="/photos/network.png"
                          alt="ドライブ追加"
                          fill
                          style={{ objectFit: "cover", borderRadius: "4px" }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 3,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#f5f5f5",
                          borderRadius: 1,
                          position: "relative",
                          aspectRatio: "16/9",
                          width: "100%",
                          order: { xs: 2, md: 1 },
                        }}
                      >
                        <Image
                          src="/photos/drive.png"
                          alt="動画選択"
                          fill
                          style={{
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          order: { xs: 1, md: 2 },
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "#764ba2",
                            color: "white",
                            fontWeight: 700,
                            width: 48,
                            height: 48,
                          }}
                        >
                          2
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            動画選択
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            動画をドライブから選択。
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 3,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: "#f093fb",
                            color: "white",
                            fontWeight: 700,
                            width: 48,
                            height: 48,
                          }}
                        >
                          3
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            視聴
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            コメント付きで動画を再生できます。
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: "#f5f5f5",
                          borderRadius: 1,
                          position: "relative",
                          aspectRatio: "16/10",
                          width: "100%",
                        }}
                      >
                        <Image
                          src="/photos/video.png"
                          alt="視聴・投稿"
                          fill
                          style={{ objectFit: "cover", borderRadius: "4px" }}
                        />
                      </Box>{" "}
                      <Alert severity="info" sx={{ mt: 1 }}>
                        動画と同じフォルダにニコニコ動画や実況のXML、JSONコメントファイルを置くことで、自動的に読み込まれます。
                      </Alert>
                      <Alert severity="info">
                        視聴画面からコメントをダウンロードすることも可能です。
                      </Alert>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  さっそく始めてみましょう
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ bgcolor: "white", color: "#667eea", fontWeight: 700 }}
                  onClick={() => router.push("/auth/login")}
                >
                  ログインする
                </Button>
              </CardContent>
            </Card>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="caption" color="text.secondary">
                © 2026 Danmaku
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
