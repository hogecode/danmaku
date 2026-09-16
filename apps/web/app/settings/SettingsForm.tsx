'use client';
import { useState, useEffect } from 'react';
import { UserSettingsDto, UpdateUserSettingsDto } from '@/lib/generated';
import {
  Card, CardContent, CardHeader, Divider, Box,
  FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, TextField, Slider, Button, Stack,
  Alert, Typography,
} from '@mui/material';

interface Props {
  settings: UserSettingsDto;
  error: string | null;
  onUpdate: (dto: UpdateUserSettingsDto) => Promise<UserSettingsDto>;
  onReset: () => Promise<UserSettingsDto>;
}

export default function SettingsForm(p: Props) {
  const [data, setData] = useState<UpdateUserSettingsDto>({});
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setData({
      theme: p.settings.theme,
      language: p.settings.language,
      auto_play_next: p.settings.auto_play_next,
      playback_speed: p.settings.playback_speed,
      danmaku_enabled: p.settings.danmaku_enabled,
      danmaku_opacity: p.settings.danmaku_opacity,
      danmaku_max_count: p.settings.danmaku_max_count,
      danmaku_display_duration: p.settings.danmaku_display_duration,
      ng_words_reg: p.settings.ng_words_reg || '',
    });
  }, [p.settings]);

  const ch = (k: string, v: any) => {
    setData(d => ({ ...d, [k]: v }));
    setOk(false);
  };

  const save = async () => {
    try {
      console.log('[SettingsForm] sending data:', data);
      await p.onUpdate(data);
      setOk(true);
      setTimeout(() => setOk(false), 3000);
    } catch (e) {
      console.error('Failed:', e);
    }
  };

  const rst = async () => {
    if (confirm('リセットしますか？')) {
      try {
        await p.onReset();
        setOk(true);
        setTimeout(() => setOk(false), 3000);
      } catch (e) {
        console.error('Failed:', e);
      }
    }
  };

  const card = (t: string, c: any) => (
    <Card sx={{ mb: 3 }}>
      <CardHeader title={t} />
      <Divider />
      <CardContent>{c}</CardContent>
    </Card>
  );

  return (
    <>
      {p.error && <Alert severity="error" sx={{ mb: 3 }}>{p.error}</Alert>}
      {ok && <Alert severity="success" sx={{ mb: 3 }}>保存しました</Alert>}

      {card('📱 表示', (
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>テーマ</InputLabel>
              <Select value={data.theme || 'light'} label="テーマ" onChange={(e) => ch('theme', e.target.value)}>
                <MenuItem value="light">ライト</MenuItem>
                <MenuItem value="dark">ダーク</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>言語</InputLabel>
              <Select value={data.language || 'jp'} label="言語" onChange={(e) => ch('language', e.target.value)}>
                <MenuItem value="jp">日本語</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      ))}

      {card('▶️ 再生', (
        <Stack spacing={3}>
          <FormControlLabel control={<Switch checked={data.auto_play_next || false} onChange={(e) => ch('auto_play_next', e.target.checked)} />} label="自動再生" />
          <FormControl fullWidth sx={{ maxWidth: '50%' }}>
            <InputLabel>速度</InputLabel>
            <Select value={data.playback_speed || '1.0'} label="速度" onChange={(e) => ch('playback_speed', e.target.value)}>
              <MenuItem value="0.5">0.5x</MenuItem>
              <MenuItem value="0.75">0.75x</MenuItem>
              <MenuItem value="1.0">1.0x</MenuItem>
              <MenuItem value="1.25">1.25x</MenuItem>
              <MenuItem value="1.5">1.5x</MenuItem>
              <MenuItem value="2.0">2.0x</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      ))}

      {card('💬 ダンマク', (
        <Stack spacing={3}>
          <FormControlLabel control={<Switch checked={data.danmaku_enabled || true} onChange={(e) => ch('danmaku_enabled', e.target.checked)} />} label="有効化" />
          <Box>
            <Typography>不透明度: {(parseFloat(data.danmaku_opacity || '1.0') * 100).toFixed(0)}%</Typography>
            <Slider min={0} max={1} step={0.1} value={parseFloat(data.danmaku_opacity || '1.0')} onChange={(e, v) => ch('danmaku_opacity', (v as number).toString())} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField fullWidth label="最大表示数" type="number" value={data.danmaku_max_count || 1000} onChange={(e) => ch('danmaku_max_count', parseInt(e.target.value))} />
            <TextField fullWidth label="表示時間 (ms)" type="number" value={data.danmaku_display_duration || 5000} onChange={(e) => ch('danmaku_display_duration', parseInt(e.target.value))} />
          </Box>
        </Stack>
      ))}

      {card('🚫 NGワード', <TextField fullWidth multiline rows={4} label="正規表現" placeholder="word1|word2" value={data.ng_words_reg || ''} onChange={(e) => ch('ng_words_reg', e.target.value)} />)}

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained" color="primary" onClick={save} size="large">💾 保存</Button>
        <Button variant="outlined" color="warning" onClick={rst} size="large">🔄 リセット</Button>
      </Stack>
    </>
  );
}
