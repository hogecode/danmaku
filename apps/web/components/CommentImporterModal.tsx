"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { NicovideoCommentImporter } from "./NicovideoCommentImporter";
import { KakologCommentImporter } from "./KakologCommentImporter";
import type { DPlayerCommentDto } from "@/lib/generated/models";

interface CommentImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommentsImported: (
    comments: DPlayerCommentDto[],
    mergeMode: boolean,
  ) => void;
  isDisabled?: boolean;
}

/**
 * コメントインポーター モーダル
 * ニコ動コメントと過去ログを取得するUI
 * 2つのタブで UI を切り替え可能
 */
export function CommentImporterModal({
  isOpen,
  onClose,
  onCommentsImported,
  isDisabled = false,
}: CommentImporterModalProps) {
  const [activeTab, setActiveTab] = useState<"niconico" | "kakolog">(
    "niconico",
  );

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontWeight: "bold",
        }}
      >
        💬 コメント インポーター
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val as "niconico" | "kakolog")}
          aria-label="comment importers"
        >
          <Tab label="🎬 ニコ動コメント" value="niconico" />
          <Tab label="📺 過去ログ" value="kakolog" />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {activeTab === "niconico" && (
          <NicovideoCommentImporter
            onCommentsImported={onCommentsImported}
            isDisabled={isDisabled}
            isModalContent={true}
          />
        )}

        {activeTab === "kakolog" && (
          <KakologCommentImporter
            onCommentsImported={onCommentsImported}
            isDisabled={isDisabled}
            isModalContent={true}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}
