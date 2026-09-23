'use client';
import { useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSettingsDto, UpdateUserSettingsDto } from "@/lib/generated";
import { settingsFormSchema, SettingsFormData } from "./settingsValidation";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Alert,
  FormHelperText,
} from "@mui/material";

interface Props {
  settings: UserSettingsDto;
  error: string | null;
  onUpdate: (dto: UpdateUserSettingsDto) => Promise<UserSettingsDto>;
  onReset: () => Promise<UserSettingsDto>;
}

export default function SettingsForm(p: Props) {
  const {
    register, 
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema as any),
    defaultValues: {
      theme: p.settings.theme as 'light' | 'dark',
      language: p.settings.language as 'jp' | 'en',
      danmaku_max_count: p.settings.danmaku_max_count,
      ng_words_reg: p.settings.ng_words_reg || [],
    },
  });

  // 初期値が変わった時にフォームをリセット
  useEffect(() => {
    reset({
      theme: p.settings.theme as 'light' | 'dark',
      language: p.settings.language as 'jp' | 'en',
      danmaku_max_count: p.settings.danmaku_max_count,
      ng_words_reg: p.settings.ng_words_reg || [],
    });
  }, [p.settings, reset]);

  const ngWordsText = watch('ng_words_reg');

  const onSubmit: SubmitHandler<any> = async (data: SettingsFormData) => {
    try {
      // ng_words_reg は配列なので、UpdateUserSettingsDto に変換
      const dto: UpdateUserSettingsDto = {
        theme: data.theme,
        language: data.language,
        danmaku_max_count: data.danmaku_max_count,
        ng_words_reg: data.ng_words_reg,
      };

      await p.onUpdate(dto);
    } catch (e) {
      console.error('Failed:', e);
    }
  };

  const handleReset = async () => {
    if (confirm('リセットしますか？')) {
      try {
        await p.onReset();
      } catch (e) {
        // TODO: errorを捕捉
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
    <form onSubmit={handleSubmit(onSubmit)}>
      {p.error && <Alert severity="error" sx={{ mb: 3 }}>{p.error}</Alert>}

      {/* Display Settings */}
      {card('📱 表示', (
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.theme}>
                  <InputLabel>テーマ</InputLabel>
                  <Select
                    {...field}
                    label="テーマ"
                    value={field.value || 'light'}
                  >
                    <MenuItem value="light">ライト</MenuItem>
                    <MenuItem value="dark">ダーク</MenuItem>
                  </Select>
                  {errors.theme && <FormHelperText>{errors.theme.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.language}>
                  <InputLabel>言語</InputLabel>
                  <Select
                    {...field}
                    label="言語"
                    value={field.value || 'jp'}
                  >
                    <MenuItem value="jp">日本語</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                  {errors.language && <FormHelperText>{errors.language.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
        </Stack>
      ))}

      {/* Danmaku Settings */}
      {card('💬 ダンマク', (
        <Stack spacing={3}>
          <TextField
            fullWidth
            type="number"
            label="最大表示数"
            {...register('danmaku_max_count', { valueAsNumber: true })}
            error={!!errors.danmaku_max_count}
            helperText={errors.danmaku_max_count?.message}
            slotProps={{
              htmlInput: { min: 1, max: 10000 },
            }}
          />
        </Stack>
      ))}

      {/* NG Word Settings */}
      {card('🚫 NGワード', (
        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={8}
            label="正規表現（1行に1つ）"
            placeholder="aaa|bbb&#10;ccc&#10;asd"
            value={ngWordsText.join('\n')}
            onChange={(e) => {
              const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
              setValue('ng_words_reg', lines);
            }}
            error={!!errors.ng_words_reg}
            helperText={
              errors.ng_words_reg?.message ||
              `登録済み: ${ngWordsText.length}個`
            }
          />
          {ngWordsText.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <strong>登録済みの正規表現:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {ngWordsText.map((pattern, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    <code>{pattern}</code>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Stack>
      ))}

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button type="submit" variant="contained" color="primary" size="large">
          💾 保存
        </Button>
        <Button
          type="button"
          variant="outlined"
          color="warning"
          onClick={handleReset}
          size="large"
        >
          🔄 リセット
        </Button>
      </Stack>
    </form>
  );
}
