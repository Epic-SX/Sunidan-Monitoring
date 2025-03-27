"use client";

import React, { useState, useEffect } from 'react';
import { NotificationSettings } from '@/types/notification'; 
import { AccordionDetails, AccordionSummary, Accordion, Alert, AlertTitle, Box, Switch, FormControlLabel, Divider, Paper, Typography, TextField, Button, Snackbar } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface NotificationFormProps {
  initialSettings: NotificationSettings;
}

export function NotificationForm({ initialSettings }: NotificationFormProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/notifications/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '設定の更新に失敗しました');
      }

      setSuccess('設定を保存しました');
    } catch (error) {
      console.error('設定保存のエラー:', error);
      setError(error instanceof Error ? error.message : '設定の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Your existing JSX form code here */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>エラー</AlertTitle>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>成功</AlertTitle>
          {success}
        </Alert>
      )}

      <Box component="form" noValidate onSubmit={handleSubmit}>
        {/* Discord Notification Settings */}
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Discord通知設定
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
                control={
                <Switch 
                    name="discord_enabled"
                    checked={settings.discord_enabled}
                    onChange={handleChange}
                />
                }
                label="Discord通知を有効にする"
            />

            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                <AlertTitle>Discord通知について</AlertTitle>
                Discordウェブフックを使用して通知を送信します。ウェブフックURLが必要です。
            </Alert>

            <TextField
                margin="normal"
                fullWidth
                id="discord_webhook"
                label="DiscordウェブフックURL"
                name="discord_webhook"
                value={settings.discord_webhook}
                onChange={handleChange}
                placeholder="Discordサーバーで作成したウェブフックURL"
            />
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
            LINE通知設定
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
            control={
                <Switch 
                name="line_enabled"
                checked={settings.line_enabled}
                onChange={handleChange}
                />
            }
            label="LINE通知を有効にする"
            />

            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            <AlertTitle>LINE通知について</AlertTitle>
            LINE Notifyを使用して通知を送信します。トークンとユーザーIDが必要です。
            </Alert>

            <TextField
            margin="normal"
            fullWidth
            name="line_token"
            label="LINEトークン"
            value={settings.line_token}
            onChange={handleChange}
            placeholder="LINE Notify トークン"
            />

            <TextField
            margin="normal"
            fullWidth
            name="line_user_id"
            label="LINEユーザーID"
            value={settings.line_user_id}
            onChange={handleChange}
            placeholder="LINEユーザーID"
            />
        </Paper>

        {/* Chatwork Notification Settings */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Chatwork通知設定
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={
              <Switch 
                name="chatwork_enabled"
                checked={settings.chatwork_enabled}
                onChange={handleChange}
              />
            }
            label="Chatwork通知を有効にする"
          />

          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            <AlertTitle>Chatwork通知について</AlertTitle>
            Chatwork APIを使用して通知を送信します。APIトークンとルームIDが必要です。
          </Alert>

          <TextField
            margin="normal"
            fullWidth
            id="chatwork_token"
            label="ChatworkAPIトークン"
            name="chatwork_token"
            value={settings.chatwork_token}
            onChange={handleChange}
            placeholder="Chatworkで発行したAPIトークン"
          />

          <TextField
            margin="normal"
            fullWidth
            id="chatwork_room_id"
            label="ChatworkルームID"
            name="chatwork_room_id"
            value={settings.chatwork_room_id}
            onChange={handleChange}
            placeholder="通知を送信するChatworkルームのID"
          />
        </Paper>

        {/* Setup Guide */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            通知設定ガイド
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Discord通知の設定方法</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                1. Discordサーバーの設定を開きます。
              </Typography>
              <Typography variant="body2" paragraph>
                2. 「連携サービス」→「ウェブフック」を選択します。
              </Typography>
              <Typography variant="body2" paragraph>
                3. 「新しいウェブフック」をクリックし、名前を設定します。
              </Typography>
              <Typography variant="body2" paragraph>
                4. 「ウェブフックURLをコピー」をクリックし、上記フォームに入力します。
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Chatwork通知の設定方法</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                1. <a href="https://www.chatwork.com/" target="_blank" rel="noopener noreferrer">Chatwork</a>にログインします。
              </Typography>
              <Typography variant="body2" paragraph>
                2. 右上のアイコンをクリックし、「設定」を選択します。
              </Typography>
              <Typography variant="body2" paragraph>
                3. 「API設定」タブを開き、APIトークンを発行します。
              </Typography>
              <Typography variant="body2" paragraph>
                4. 通知を送信したいチャットルームを開き、URLからルームIDを確認します（例: https://www.chatwork.com/#!rid12345 の「12345」部分）。
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Paper>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isLoading}
          sx={{ mt: 3, mb: 2 }}
        >
          {isLoading ? '保存中...' : '設定を保存'}
        </Button>
      </Box>
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={() => {
          setSuccess(null);
          setError(null);
        }}
        message={success || error}
      />
    </div>
  );
} 