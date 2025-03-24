import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinkIcon from '@mui/icons-material/Link';
import LoginIcon from '@mui/icons-material/Login';
import AddIcon from '@mui/icons-material/Add';

export default function AddProduct() {
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        商品追加
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>商品情報の自動取得について</AlertTitle>
          商品URLを入力すると、商品名やサイズ情報が自動的に取得されます。
        </Alert>

        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="url"
            label="商品URL"
            name="url"
            autoFocus
            placeholder="https://snkrdunk.com/sneakers/..."
            helperText="スニダンの商品ページのURLを入力してください"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            startIcon={<AddIcon />}
          >
            商品を追加
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          商品の追加方法
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <ListItemText 
              primary="スニダンで商品ページを開き、URLをコピーします" 
              secondary="例: https://snkrdunk.com/sneakers/detail/19728" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText 
              primary="スニダンにログインしていることを確認してください" 
              secondary="ログインしていないと商品情報を取得できない場合があります" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText 
              primary="上のフォームにURLを貼り付けて「商品を追加」ボタンをクリックします" 
              secondary="商品情報が自動的に取得され、監視リストに追加されます" 
            />
          </ListItem>
        </List>
      </Paper>
    </div>
  );
} 