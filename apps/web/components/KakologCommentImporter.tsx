"use client";
import { useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Stack,
  Typography,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useKakologComments } from "@/hooks/useKakologComments";
import { CHANNELS_BY_GROUP } from "@/lib/constants/channels";
import type { KakologCommentDto } from "@/lib/generated/models";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import ja from "date-fns/locale/ja";

// ロケール設定
registerLocale("ja", ja);
setDefaultLocale("ja");

interface KakologCommentImporterProps {
  onCommentsImported: (
    comments: KakologCommentDto[],
    mergeMode: boolean,
  ) => void;
  isDisabled?: boolean;
  isModalContent?: boolean;
}

export function KakologCommentImporter({
  onCommentsImported,
  isDisabled = false,
  isModalContent = false,
}: KakologCommentImporterProps) {
  const [channelId, setChannelId] = useState("");
  const [startDateTime, setStartDateTime] = useState<Date | null>(new Date(Date.now() - 86400000)); // 1日前
  const [endDateTime, setEndDateTime] = useState<Date | null>(new Date());
  const [mergeMode, setMergeMode] = useState(false);
  const { mutate, isPending, error } = useKakologComments();

  const convertToUnixTimestamp = (date: Date | null): number | null => {
    if (!date) return null;
    return Math.floor(date.getTime() / 1000);
  };

  const handleStartTimeAdjust = (min: number) => {
    if (!startDateTime) return;
    const newDate = new Date(startDateTime);
    newDate.setMinutes(newDate.getMinutes() + min);
    setStartDateTime(newDate);
  };

  const handleEndTimeAdjust = (min: number) => {
    if (!endDateTime) return;
    const newDate = new Date(endDateTime);
    newDate.setMinutes(newDate.getMinutes() + min);
    setEndDateTime(newDate);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!channelId.trim()) return;
    const startTime = convertToUnixTimestamp(startDateTime);
    const endTime = convertToUnixTimestamp(endDateTime);
    if (!startTime || !endTime || startTime >= endTime) return;
    mutate(
      { channelId: channelId.trim(), startTime, endTime },
      {
        onSuccess: (res) => {
          onCommentsImported(res.comments || [], mergeMode);
          setChannelId("");
          setStartDateTime(null);
          setEndDateTime(null);
        },
      },
    );
  };

  const isFormValid =
    channelId.trim() &&
    startDateTime &&
    endDateTime &&
    startDateTime < endDateTime;

  return (
    <Box
        component="form"
        onSubmit={handleSubmit}
        sx={
          isModalContent
            ? {}
            : { backgroundColor: "#424242", borderRadius: 1, p: 3, mt: 3 }
        }
      >
        {!isModalContent && (
          <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
            📺 Kakolog（過去ログ）
          </Typography>
        )}
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>チャンネル</InputLabel>
            <Select
              value={channelId}
              label="チャンネル"
              onChange={(e: SelectChangeEvent) => setChannelId(e.target.value)}
              disabled={isPending || isDisabled}
            >
              {Object.entries(CHANNELS_BY_GROUP).map(([g, ch]) => [
                <MenuItem key={`g-${g}`} disabled sx={{ fontWeight: "bold" }}>
                  {g}
                </MenuItem>,
                ...ch.map((c) => (
                  <MenuItem key={c.id} value={c.id} sx={{ pl: 4 }}>
                    {c.id}: {c.name}
                  </MenuItem>
                )),
              ])}
            </Select>
          </FormControl>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              開始日時
            </Typography>
            <Stack spacing={1}>
              <ReactDatePicker
                selected={startDateTime}
                onChange={setStartDateTime}
                showTimeSelect
                timeIntervals={5}
                dateFormat="yyyy/MM/dd HH:mm"
                disabled={isPending || isDisabled}
                customInput={<TextField fullWidth />}
              />
              <ButtonGroup size="small" fullWidth>
                <Button
                  variant="outlined"
                  startIcon={<RemoveIcon />}
                  onClick={() => handleStartTimeAdjust(-30)}
                  disabled={!startDateTime || isPending || isDisabled}
                >
                  30分前
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RemoveIcon />}
                  onClick={() => handleStartTimeAdjust(-5)}
                  disabled={!startDateTime || isPending || isDisabled}
                >
                  5分前
                </Button>
              </ButtonGroup>
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              終了日時
            </Typography>
            <Stack spacing={1}>
              <ReactDatePicker
                selected={endDateTime}
                onChange={setEndDateTime}
                showTimeSelect
                timeIntervals={5}
                dateFormat="yyyy/MM/dd HH:mm"
                disabled={isPending || isDisabled}
                customInput={<TextField fullWidth />}
              />
              <ButtonGroup size="small" fullWidth>
                <Button
                  variant="outlined"
                  endIcon={<AddIcon />}
                  onClick={() => handleEndTimeAdjust(5)}
                  disabled={!endDateTime || isPending || isDisabled}
                >
                  5分後
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<AddIcon />}
                  onClick={() => handleEndTimeAdjust(30)}
                  disabled={!endDateTime || isPending || isDisabled}
                >
                  30分後
                </Button>
              </ButtonGroup>
            </Stack>
          </Box>
          <Paper sx={{ p: 2 }}>
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
                    既存コメントに<strong>追加</strong>
                  </Typography>
                </Box>
              }
            />
          </Paper>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isFormValid || isPending || isDisabled}
            fullWidth
            sx={{ py: 1.5, fontWeight: "bold" }}
          >
            {isPending ? "⏳ 取得中..." : "コメント取得"}
          </Button>
          {error && (
            <Alert severity="error">
              <strong>❌ エラー:</strong> {error.message}
            </Alert>
          )}
          <Alert severity="info">チャンネルと日時を指定してください</Alert>
        </Stack>
      </Box>
  );
}
