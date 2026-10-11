'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { NicovideoDownloader } from '@/components/NicovideoDownloader';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

export default function NicovideoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              ニコ動ダウンロード
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
              ニコ動ダウンロード
            </Typography>
            <NicovideoDownloader />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
