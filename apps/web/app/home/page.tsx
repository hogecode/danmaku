'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import {
  AppBar,
  Toolbar,
  Container,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  Avatar,
  Stack,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider,
} from '@mui/material';


export default function HomePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuthContext();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700 }}
          >
            dnmaku
          </Typography>
          <Button color="inherit" onClick={() => logout()}>
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
            gap: 3,
          }}
        >
          <Box>
            <Card sx={{ position: "sticky", top: 24, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ textAlign: "center" }}>
                  {user.picture_url && (
                    <Avatar
                      src={user.picture_url}
                      alt={user.name}
                      sx={{
                        width: 100,
                        height: 100,
                        mx: "auto",
                        mb: 2,
                        border: "4px solid",
                        borderColor: "primary.main",
                      }}
                    />
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {user.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {user.email}
                  </Typography>
                  {user.last_login && (
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, bgcolor: "background.default", mt: 2 }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        Last Login
                      </Typography>
                      <Typography variant="body2">
                        {new Date(user.last_login).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Stack spacing={3}>
              <Card sx={{ boxShadow: 3 }}>
                <CardHeader
                  title="Google Drive"
                  titleTypographyProps={{
                    variant: "h5",
                    sx: { fontWeight: 700 },
                  }}
                />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="body1" color="text.secondary">
                      Browse video files in Google Drive and stream MP4 files.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => router.push("/drive")}
                    >
                      Open Drive →
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {user.drives && user.drives.length > 0 && (
                <Card sx={{ boxShadow: 3 }}>
                  <CardHeader
                    title={`Connected Drives (${user.drives.length})`}
                    titleTypographyProps={{
                      variant: "h6",
                      sx: { fontWeight: 700 },
                    }}
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={1}>
                      {user.drives.map((drive, idx) => (
                        <Paper
                          key={idx}
                          variant="outlined"
                          sx={{ p: 1.5, bgcolor: "background.default" }}
                        >
                          <Typography variant="body2">
                            <strong>{drive.provider}</strong>:{" "}
                            {drive.provider || "Unnamed"}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Box>
        </Box>
      </Container>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          py: 3,
          mt: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1} sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Copyright 2026 Danmaku
            </Typography>
            <Typography variant="caption" color="text.secondary">
              API: {process.env.NEXT_PUBLIC_API_BASE_URL}
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}