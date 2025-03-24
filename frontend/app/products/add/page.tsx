'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from '../../api/apiService';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  AlertTitle, 
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { 
  Info as InfoIcon, 
  Add as AddIcon, 
  ArrowBack as ArrowBackIcon,
  LooksOne as OneIcon,
  LooksTwo as TwoIcon,
  Looks3 as ThreeIcon,
  Looks4 as FourIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

export default function AddProduct() {
  const router = useRouter();
  const [productUrl, setProductUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingProduct, setExistingProduct] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productUrl) {
      setError('商品URLを入力してください。');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setExistingProduct(null);
      
      const result = await productsApi.addProduct(productUrl);
      
      setSuccess('商品が正常に追加されました。');
      setProductUrl('');
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (err: any) {
      console.error('Failed to add product:', err);
      
      // Check if this is a "product already exists" error with product data
      if (err.message?.includes('Product already exists') && err.data?.product) {
        setExistingProduct(err.data.product);
        setError('この商品は既に追加されています。ホームページで確認できます。');
      } else {
        // Display the error message from the backend
        setError(err.message || '商品の追加に失敗しました。もう一度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        商品追加
      </Typography>
      
      <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
        {error && (
          <Alert severity="error" variant="filled">
            <AlertTitle>エラー</AlertTitle>
            {error}
            {existingProduct && (
              <Button 
                variant="contained" 
                color="inherit" 
                size="small" 
                sx={{ mt: 1 }}
                onClick={() => router.push('/')}
              >
                ホームページで確認する
              </Button>
            )}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" variant="filled">
            <AlertTitle>成功</AlertTitle>
            {success}
          </Alert>
        )}
        
        <Alert severity="info" icon={<InfoIcon />}>
          商品URLを入力すると、商品情報とサイズ情報が自動的に取得されます。
        </Alert>
        
        <Paper component="form" onSubmit={handleSubmit} elevation={2} sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" component="label" htmlFor="productUrl" gutterBottom>
              商品URL <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <TextField
              id="productUrl"
              fullWidth
              variant="outlined"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://snkrdunk.com/products/..."
              disabled={loading}
              required
              helperText="スニダンの商品ページのURLを入力してください。"
              sx={{ mt: 1 }}
              inputProps={{
                suppressHydrationWarning: true
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/')}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              {loading ? '処理中...' : '商品を追加'}
            </Button>
          </Box>
        </Paper>
        
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              商品の追加方法
            </Typography>
            
            <List sx={{ mb: 2 }}>
              <ListItem>
                <ListItemIcon>
                  <OneIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="スニダンで追加したい商品ページを開きます。" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TwoIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="ブラウザのアドレスバーからURLをコピーします。" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ThreeIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="上記の入力欄にURLを貼り付けます。" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FourIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="「商品を追加」ボタンをクリックします。" />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                <strong>注意:</strong> スニダンのアカウントにログインしている必要があります。
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
} 