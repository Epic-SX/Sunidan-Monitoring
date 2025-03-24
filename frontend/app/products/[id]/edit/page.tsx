import React from 'react';
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

// Mock data for demonstration
const mockProduct = {
  id: 1,
  name: 'Nike Air Jordan 1 High OG "Chicago"',
  image_url: 'https://images.stockx.com/images/Air-Jordan-1-Retro-High-Chicago-2015-Product.jpg',
  url: 'https://snkrdunk.com/sneakers/detail/19728',
  is_active: true,
  sizes: [
    { 
      id: 1,
      size: '26.0cm', 
      current_price: 85000, 
      previous_price: 90000,
      lowest_price: 82000,
      highest_price: 95000,
      notify_below: 80000,
      notify_above: 100000,
      notify_on_any_change: false,
    },
    { 
      id: 2,
      size: '27.0cm', 
      current_price: 78000, 
      previous_price: 78000,
      lowest_price: 75000,
      highest_price: 88000,
      notify_below: 75000,
      notify_above: null,
      notify_on_any_change: true,
    },
    { 
      id: 3,
      size: '28.0cm', 
      current_price: 92000, 
      previous_price: 88000,
      lowest_price: 85000,
      highest_price: 92000,
      notify_below: null,
      notify_above: 95000,
      notify_on_any_change: false,
    },
  ],
};

export default function EditProduct({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the product data based on the ID
  const productId = parseInt(params.id);
  
  return (
    <div>
      <Box sx={{ mb: 3 }}>
        <Button 
          component={Link} 
          href="/products" 
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
          image={mockProduct.image_url}
          alt={mockProduct.name}
        />
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="h2" variant="h5">
            {mockProduct.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            URL: {mockProduct.url}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={<Switch checked={mockProduct.is_active} name="is_active" />}
              label="この商品を監視する"
            />
          </Box>
        </CardContent>
      </Card>

      <Box component="form" noValidate>
        <Typography variant="h5" gutterBottom>
          通知設定
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          各サイズごとに価格変動の通知条件を設定できます。
        </Typography>

        {mockProduct.sizes.map((size) => (
          <Paper key={size.id} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              サイズ: {size.size}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  現在価格: ¥{size.current_price.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  最安値: ¥{size.lowest_price.toLocaleString()} / 最高値: ¥{size.highest_price.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch checked={size.notify_on_any_change} name={`notify_on_any_change_${size.id}`} />}
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
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            size="large"
          >
            設定を保存
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            size="large"
          >
            商品を削除
          </Button>
        </Box>
      </Box>
    </div>
  );
} 