'use client';

import { useEffect } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Link from 'next/link';
import './globals.css';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This effect runs only on the client side and helps with hydration issues
  useEffect(() => {
    // Remove any browser-added attributes that might cause hydration mismatches
    document.querySelectorAll('[fdprocessedid]').forEach(el => {
      el.removeAttribute('fdprocessedid');
    });
  }, []);

  return (
    <html lang="ja">
      <head>
        <title>スニダン価格監視 | Snidan Price Monitor</title>
        <meta name="description" content="スニダンの商品価格を監視するアプリケーション" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <AppBar position="static" color="primary" elevation={0}>
                <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    スニダン価格監視
                  </Typography>
                  <Button color="inherit" component={Link} href="/">
                    ホーム
                  </Button>
                  <Button color="inherit" component={Link} href="/products/add">
                    商品追加
                  </Button>
                  <Button color="inherit" component={Link} href="/settings/notification">
                    通知設定
                  </Button>
                  <Button color="inherit" component={Link} href="/settings/snidan">
                    スニダン設定
                  </Button>
                </Toolbar>
              </AppBar>
              
              <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
                <Container maxWidth="lg">
                  {children}
                </Container>
              </Box>
              
              <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
                <Container maxWidth="lg">
                  <Typography variant="body2" color="text.secondary" align="center">
                    &copy; {new Date().getFullYear()} スニダン価格監視
                  </Typography>
                </Container>
              </Box>
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
} 