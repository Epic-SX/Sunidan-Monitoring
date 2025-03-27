'use client';

import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import Link from '@mui/material/Link';

export default function SnidanSettings() {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Collect data as JSON instead of FormData
    const username = formData.get('username');
    const password = formData.get('password');
    const monitoring_interval = formData.get('monitoring_interval');

    // Validate inputs
    if (!username || !password || !monitoring_interval) {
      setErrorMessage('すべてのフィールドを入力してください。');
      return; // Exit if validation fails
    }

    const data = {
      username,
      password,
      monitoring_interval,
    };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/settings/snidan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
        },
        body: JSON.stringify(data), // Send data as JSON
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || '設定の更新に失敗しました');
      }

      setSuccessMessage('設定を保存しました');
    } catch (error) {
      console.error('設定保存のエラー:', error);
      setErrorMessage(error instanceof Error ? error.message : '設定の更新に失敗しました');
    }
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        スニダン設定
      </Typography>

      <Box component="form"
        onSubmit={handleSubmit}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            スニダンアカウント設定
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>アカウント情報の取り扱いについて</AlertTitle>
            入力されたアカウント情報はローカルに保存され、スニダンの商品ページにアクセスするためにのみ使用されます。
            アカウント情報は暗号化されずに保存されますので、自己責任でご使用ください。
          </Alert>

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="ユーザー名（メールアドレス）"
            name="username"
            autoComplete="email"
            placeholder="スニダンのログインメールアドレス"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="パスワード"
            type="password"
            id="password"
            autoComplete="current-password"
            placeholder="スニダンのログインパスワード"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="end"
                  >
                    <VisibilityOff />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="monitoring_interval"
            label="監視間隔（秒）"
            name="monitoring_interval"
            type="number"
            defaultValue={10}
            InputProps={{
              endAdornment: <InputAdornment position="end">秒</InputAdornment>,
            }}
            helperText="推奨値: 10秒以上。短すぎる間隔を設定するとスニダンのサーバーに負荷をかける可能性があります。"
          />
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            スニダンアカウントについて
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography paragraph>
            このアプリケーションは、スニダンの商品ページにアクセスして価格情報を取得します。
            スニダンのアカウントをお持ちでない場合は、
            <Link href="https://snkrdunk.com/signup" target="_blank" rel="noopener noreferrer">
              こちら
            </Link>
            から登録してください。
          </Typography>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            重要な注意事項:
          </Typography>

          <ul>
            <li>
              <Typography paragraph>
                スニダンの利用規約に従って使用してください。
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                短い監視間隔を設定すると、スニダンのサーバーに負荷をかける可能性があります。
                適切な間隔（10秒以上）を設定することをお勧めします。
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                このアプリケーションはスニダンの公式アプリではありません。
                スニダンのサービス変更により、機能が動作しなくなる可能性があります。
              </Typography>
            </li>
          </ul>
        </Paper>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ mt: 3, mb: 2 }}
        >
          設定を保存
        </Button>
      </Box>
    </div>
  );
} 