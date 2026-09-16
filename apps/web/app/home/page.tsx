'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/provider/AuthProvider';
import { Sidebar } from '@/components/Sidebar';
import {
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
  CircularProgress,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="static"
          elevation={1}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setSidebarOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ホーム
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
              <Box>
                <Card sx={{ position: 'sticky', top: 24, boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ textAlign: 'center' }}>
                      {user.picture_url && (
                        <Avatar
                          src={user.picture_url}
                          alt={user.name}
                          sx={{ width: 100, height: 100, mx: 'auto', mb: 2, border: '4px solid', borderColor: 'primary.main' }}
                        />
                      )}
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {user.email}
                      </Typography>
                      {user.last_login && (
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mt: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
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
                      titleTypographyProps={{ variant: 'h5', sx: { fontWeight: 700 } }}
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
                          onClick={() => router.push('/drive')}
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
                        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 700 } }}
                      />
                      <Divider />
                      <CardContent>
                        <Stack spacing={1}>
                          {user.drives.map((drive, idx) => (
                            <Paper key={idx} variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
                              <Typography variant="body2">
                                <strong>{drive.provider}</strong>: {drive.provider || 'Unnamed'}
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
        </Box>
      </Box>
    </Box>
  );
}