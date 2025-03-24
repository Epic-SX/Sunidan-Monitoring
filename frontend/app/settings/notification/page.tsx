import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';

export default function NotificationSettings() {
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        通知設定
      </Typography>

      <Box component="form" noValidate>
        {/* Discord Notification Settings */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Discord通知設定
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={<Switch name="discord_enabled" />}
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
            placeholder="Discordサーバーで作成したウェブフックURL"
          />
        </Paper>

        {/* Chatwork Notification Settings */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Chatwork通知設定
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={<Switch name="chatwork_enabled" />}
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
            placeholder="Chatworkで発行したAPIトークン"
          />

          <TextField
            margin="normal"
            fullWidth
            id="chatwork_room_id"
            label="ChatworkルームID"
            name="chatwork_room_id"
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
          sx={{ mt: 3, mb: 2 }}
        >
          設定を保存
        </Button>
      </Box>
    </div>
  );
} 