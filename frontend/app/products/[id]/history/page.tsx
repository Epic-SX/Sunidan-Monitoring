import React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

// This would be a client component in a real app to handle the chart
// For this example, we'll just show a placeholder
const PriceHistoryChart = ({ size }: { size: string }) => (
  <Paper
    sx={{
      p: 2,
      height: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f5f5f5',
    }}
  >
    <Typography variant="body1" color="text.secondary">
      {size}のサイズの価格履歴グラフがここに表示されます
    </Typography>
  </Paper>
);

// Mock data for demonstration
const mockProduct = {
  id: 1,
  name: 'Nike Air Jordan 1 High OG "Chicago"',
  image_url: 'https://images.stockx.com/images/Air-Jordan-1-Retro-High-Chicago-2015-Product.jpg',
  sizes: [
    { 
      size: '26.0cm', 
      current_price: 85000, 
      previous_price: 90000,
      lowest_price: 82000,
      highest_price: 95000,
    },
    { 
      size: '27.0cm', 
      current_price: 78000, 
      previous_price: 78000,
      lowest_price: 75000,
      highest_price: 88000,
    },
    { 
      size: '28.0cm', 
      current_price: 92000, 
      previous_price: 88000,
      lowest_price: 85000,
      highest_price: 92000,
    },
  ],
};

export default function ProductHistory({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the product data based on the ID
  const productId = parseInt(params.id);
  
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
        価格履歴
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
          
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {mockProduct.sizes.map((size) => (
              <Chip 
                key={size.size} 
                label={`${size.size}: ¥${size.current_price.toLocaleString()}`} 
                variant="outlined"
                color={
                  size.current_price < size.previous_price ? 'success' : 
                  size.current_price > size.previous_price ? 'error' : 
                  'default'
                }
              />
            ))}
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              価格情報
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  最安値
                </Typography>
                <Typography variant="body1" color="success.main" fontWeight="bold">
                  ¥{Math.min(...mockProduct.sizes.map(s => s.lowest_price)).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  最高値
                </Typography>
                <Typography variant="body1" color="error.main" fontWeight="bold">
                  ¥{Math.max(...mockProduct.sizes.map(s => s.highest_price)).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Tabs value={0} aria-label="size tabs">
          {mockProduct.sizes.map((size, index) => (
            <Tab key={size.size} label={size.size} id={`tab-${index}`} />
          ))}
        </Tabs>
      </Paper>

      <PriceHistoryChart size={mockProduct.sizes[0].size} />
    </div>
  );
} 