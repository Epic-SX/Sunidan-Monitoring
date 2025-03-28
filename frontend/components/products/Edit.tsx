"use client";

import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link';
import { Product, Size } from '@/types/product';

interface ProductEditProps {
  initialProduct: Product;
}

export function ProductEdit({ initialProduct }: ProductEditProps) {
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchChange = (field: 'is_active') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProduct(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleSizeChange = (sizeId: number, field: keyof Size, value: any) => {
    setProduct(prev => ({
      ...prev,
      sizes: prev.sizes.map(size =>
        size.id === sizeId
          ? { ...size, [field]: value }
          : size
      )
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/products/${product.id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('製品の更新に失敗しました');
      }

      // Show success message or handle successful update
    } catch (error) {
      console.error('製品更新のエラー:', error);
      // Handle error (show error message)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Box sx={{ mb: 3 }}>
        <Button 
          component={Link} 
          href="/" 
          startIcon={<ArrowBackIcon />}
        >
          商品一覧に戻る
        </Button>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        商品設定
      </Typography>

      <Card sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <CardMedia
          component="img"
          sx={{ 
            width: { xs: '100%', md: 200 }, 
            height: { xs: 200, md: 'auto' },
            objectFit: 'contain',
            p: 2,
            bgcolor: '#f5f5f5'
          }}
          image={product.image_url}
          alt={product.name}
        />
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="h2" variant="h5">
            {product.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            URL: {product.url}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={product.is_active} 
                  onChange={handleSwitchChange('is_active')}
                  name="is_active" 
                />
              }
              label="この商品を監視する"
            />
          </Box>
        </CardContent>
      </Card>

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>
          通知設定
        </Typography>
        
        {product.sizes.map((size: Size) => (
          <Paper key={size.id} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              サイズ: {size.size}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  現在価格: ¥{size.current_price ? size.current_price.toLocaleString() : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  最安値: ¥{size.lowest_price ? size.lowest_price.toLocaleString() : '-'} / 
                  最高値: ¥{size.highest_price ? size.highest_price.toLocaleString() : '-'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={size.notify_on_any_change}
                      onChange={(e) => handleSizeChange(size.id, 'notify_on_any_change', e.target.checked)}
                      name={`notify_on_any_change_${size.id}`}
                    />
                  }
                  label="価格変動時に常に通知する"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="下限価格"
                  name={`notify_below_${size.id}`}
                  type="number"
                  value={size.notify_below || ''}
                  onChange={(e) => handleSizeChange(size.id, 'notify_below', e.target.value === '' ? null : Number(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                  }}
                  helperText="この価格以下になったら通知します"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="上限価格"
                  name={`notify_above_${size.id}`}
                  type="number"
                  value={size.notify_above || ''}
                  onChange={(e) => handleSizeChange(size.id, 'notify_above', e.target.value === '' ? null : Number(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                  }}
                  helperText="この価格以上になったら通知します"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            size="large"
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '設定を保存'}
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            size="large"
            disabled={isLoading}
          >
            商品を削除
          </Button>
        </Box>
      </Box>
    </div>
  );
} 