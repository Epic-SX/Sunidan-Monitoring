import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';

// Mock data for demonstration
const mockProducts = [
  {
    id: 1,
    name: 'Nike Air Jordan 1 High OG "Chicago"',
    image_url: 'https://images.stockx.com/images/Air-Jordan-1-Retro-High-Chicago-2015-Product.jpg',
    sizes: [
      { size: '26.0cm', current_price: 85000, previous_price: 90000 },
      { size: '27.0cm', current_price: 78000, previous_price: 78000 },
      { size: '28.0cm', current_price: 92000, previous_price: 88000 },
    ],
    is_active: true,
  },
  {
    id: 2,
    name: 'Nike Dunk Low "Panda"',
    image_url: 'https://images.stockx.com/images/Nike-Dunk-Low-Retro-White-Black-Panda-2021-Product.jpg',
    sizes: [
      { size: '25.5cm', current_price: 22000, previous_price: 24000 },
      { size: '26.5cm', current_price: 21000, previous_price: 21000 },
    ],
    is_active: true,
  },
  {
    id: 3,
    name: 'Adidas Yeezy Boost 350 V2 "Zebra"',
    image_url: 'https://images.stockx.com/images/Adidas-Yeezy-Boost-350-V2-Zebra-Product.jpg',
    sizes: [
      { size: '27.0cm', current_price: 35000, previous_price: 32000 },
      { size: '28.0cm', current_price: 38000, previous_price: 38000 },
      { size: '29.0cm', current_price: 42000, previous_price: 45000 },
    ],
    is_active: false,
  },
];

export default function Home() {
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          商品一覧
        </Typography>
        <TextField
          placeholder="商品を検索..."
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <Grid container spacing={3}>
        {mockProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                opacity: product.is_active ? 1 : 0.7,
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image_url}
                alt={product.name}
                sx={{ objectFit: 'contain', p: 2, bgcolor: '#f5f5f5' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {product.name}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {product.sizes.map((size) => (
                    <Box key={size.size} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={size.size} size="small" />
                      <Box>
                        <Typography 
                          component="span" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: size.current_price < size.previous_price ? 'success.main' : 
                                  size.current_price > size.previous_price ? 'error.main' : 'text.primary'
                          }}
                        >
                          ¥{size.current_price.toLocaleString()}
                        </Typography>
                        {size.current_price !== size.previous_price && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {size.current_price < size.previous_price ? '↓' : '↑'}
                            {Math.abs(size.current_price - size.previous_price).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  component={Link}
                  href={`/products/${product.id}/edit`}
                >
                  編集
                </Button>
                <Button 
                  size="small" 
                  startIcon={<HistoryIcon />}
                  component={Link}
                  href={`/products/${product.id}/history`}
                >
                  履歴
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                >
                  削除
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
} 