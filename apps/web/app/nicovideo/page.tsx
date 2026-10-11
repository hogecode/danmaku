import { Metadata } from "next";
import { Container, Box, Typography } from "@mui/material";
import { NicovideoDownloader } from "@/components/NicovideoDownloader";

export const metadata: Metadata = {
  title: "ニコ動ダウンロード | Danmaku",
  description: "ニコニコ動画をダウンロード。",
};

export default function NicovideoPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <NicovideoDownloader />
    </Container>
  );
}
