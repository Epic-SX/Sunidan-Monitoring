'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from './api/apiService';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Button, 
  Chip, 
  Box, 
  Alert, 
  CircularProgress, 
  Divider,
  IconButton,
  Paper
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  History as HistoryIcon, 
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';

// Define types for our data
interface Size {
  size: string;
  current_price: number;
  previous_price: number;
}

interface Product {
  id: number;
  name: string;
  image_url: string;
  sizes: Size[];
  is_active: boolean;
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await productsApi.getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
        // Use mock data for demonstration if API fails
        setProducts([
          {
            id: 1,
            name: 'Nike Air Jordan 1 High OG "Chicago"',
            image_url: 'https://images.stockx.com/images/Air-Jordan-1-Retro-High-Chicago-2015-Product.jpg',
            sizes: [
              { size: '26.0cm', current_price: 85000, previous_price: 90000 },
              { size: '27.0cm', current_price: 78000, previous_price: 78000 },
            ],
            is_active: true,
          },
          {
            id: 2,
            name: 'Nike Dunk Low "Panda"',
            image_url: 'https://images.stockx.com/images/Nike-Dunk-Low-Retro-White-Black-Panda-2021-Product.jpg',
            sizes: [
              { size: '25.5cm', current_price: 22000, previous_price: 24000 },
            ],
            is_active: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('この商品を削除してもよろしいですか？')) {
      try {
        await productsApi.deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('商品の削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        スニダン価格監視 | Snidan Price Monitor
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {products.length} products being monitored
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => router.push('/products/add')}
            >
              商品追加
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {products.map(product => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image_url}
                    alt={product.name}
                    sx={{ objectFit: 'contain', bgcolor: '#f5f5f5', p: 2 }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {product.name}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      {product.sizes.map(size => (
                        <Box 
                          key={size.size} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            py: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Chip 
                            label={size.size} 
                            size="small" 
                            variant="outlined" 
                            sx={{ minWidth: 70, justifyContent: 'center' }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="body1" 
                              fontWeight="bold"
                              color={
                                size.current_price < size.previous_price 
                                  ? 'success.main' 
                                  : size.current_price > size.previous_price 
                                    ? 'error.main' 
                                    : 'text.primary'
                              }
                            >
                              ¥{size.current_price.toLocaleString()}
                            </Typography>
                            
                            {size.current_price !== size.previous_price && (
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  ml: 1,
                                  fontSize: '0.75rem',
                                  color: size.current_price < size.previous_price 
                                    ? 'success.main' 
                                    : 'error.main'
                                }}
                              >
                                {size.current_price < size.previous_price 
                                  ? <ArrowDownIcon fontSize="small" /> 
                                  : <ArrowUpIcon fontSize="small" />
                                }
                                {Math.abs(size.current_price - size.previous_price).toLocaleString()}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions sx={{ p: 1.5 }}>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => router.push(`/products/${product.id}/edit`)}
                    >
                      編集
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<HistoryIcon />}
                      onClick={() => router.push(`/products/${product.id}/history`)}
                    >
                      履歴
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px dashed',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  }
                }}
                onClick={() => router.push('/products/add')}
              >
                <AddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  商品追加
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add new products to monitor
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
} 