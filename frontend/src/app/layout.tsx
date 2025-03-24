import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HistoryIcon from '@mui/icons-material/History';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'スニダン価格監視 | Snidan Price Monitor',
  description: 'Monitor Snidan product prices and get notified of changes',
};

const drawerWidth = 240;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuItems = [
    { text: '商品一覧', icon: <HomeIcon />, href: '/' },
    { text: '商品追加', icon: <AddIcon />, href: '/products/add' },
    { text: '通知履歴', icon: <HistoryIcon />, href: '/notifications' },
    { text: 'スニダン設定', icon: <SettingsIcon />, href: '/settings/snidan' },
    { text: '通知設定', icon: <NotificationsIcon />, href: '/settings/notification' },
  ];

  return (
    <html lang="ja">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
              {/* Sidebar */}
              <Drawer
                variant="permanent"
                sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
              >
                <Toolbar>
                  <Typography variant="h6" noWrap component="div">
                    スニダン価格監視
                  </Typography>
                </Toolbar>
                <Divider />
                <List>
                  {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                      <ListItemButton component={Link} href={item.href}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Drawer>

              {/* Main content */}
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Container maxWidth="lg">
                  {children}
                </Container>
              </Box>
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
} 