import React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Link from 'next/link';

// Mock data for demonstration
const mockNotifications = [
  {
    id: 1,
    product_id: 1,
    product_name: 'Nike Air Jordan 1 High OG "Chicago"',
    size: '26.0cm',
    old_price: 90000,
    new_price: 85000,
    notification_type: 'below',
    sent_to: 'discord',
    timestamp: '2023-03-05T09:30:00',
  },
  {
    id: 2,
    product_id: 2,
    product_name: 'Nike Dunk Low "Panda"',
    size: '25.5cm',
    old_price: 24000,
    new_price: 22000,
    notification_type: 'change',
    sent_to: 'discord',
    timestamp: '2023-03-04T15:45:00',
  },
  {
    id: 3,
    product_id: 3,
    product_name: 'Adidas Yeezy Boost 350 V2 "Zebra"',
    size: '27.0cm',
    old_price: 32000,
    new_price: 35000,
    notification_type: 'above',
    sent_to: 'chatwork',
    timestamp: '2023-03-03T12:15:00',
  },
  {
    id: 4,
    product_id: 1,
    product_name: 'Nike Air Jordan 1 High OG "Chicago"',
    size: '28.0cm',
    old_price: 88000,
    new_price: 92000,
    notification_type: 'above',
    sent_to: 'chatwork',
    timestamp: '2023-03-02T18:20:00',
  },
];

// Helper function to format notification type
const formatNotificationType = (type: string) => {
  switch (type) {
    case 'below':
      return { label: '下限値通知', color: 'success' };
    case 'above':
      return { label: '上限値通知', color: 'error' };
    case 'change':
      return { label: '変動通知', color: 'info' };
    default:
      return { label: type, color: 'default' };
  }
};

// Helper function to format notification service
const formatNotificationService = (service: string) => {
  switch (service) {
    case 'discord':
      return { label: 'Discord', color: 'primary' };
    case 'chatwork':
      return { label: 'Chatwork', color: 'warning' };
    default:
      return { label: service, color: 'default' };
  }
};

export default function NotificationHistory() {
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        通知履歴
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="notification history table">
          <TableHead>
            <TableRow>
              <TableCell>日時</TableCell>
              <TableCell>商品</TableCell>
              <TableCell>サイズ</TableCell>
              <TableCell>価格変動</TableCell>
              <TableCell>通知タイプ</TableCell>
              <TableCell>通知先</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockNotifications.map((notification) => {
              const notificationType = formatNotificationType(notification.notification_type);
              const notificationService = formatNotificationService(notification.sent_to);
              const priceDiff = notification.new_price - notification.old_price;
              const formattedDate = new Date(notification.timestamp).toLocaleString('ja-JP');
              
              return (
                <TableRow
                  key={notification.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {formattedDate}
                  </TableCell>
                  <TableCell>
                    <Link href={`/products/${notification.product_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {notification.product_name}
                    </Link>
                  </TableCell>
                  <TableCell>{notification.size}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        component="span"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'text.secondary',
                        }}
                      >
                        ¥{notification.old_price.toLocaleString()}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: 'bold',
                          color: priceDiff < 0 ? 'success.main' : priceDiff > 0 ? 'error.main' : 'text.primary',
                        }}
                      >
                        ¥{notification.new_price.toLocaleString()}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          color: priceDiff < 0 ? 'success.main' : priceDiff > 0 ? 'error.main' : 'text.primary',
                        }}
                      >
                        ({priceDiff < 0 ? '↓' : '↑'}{Math.abs(priceDiff).toLocaleString()})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notificationType.label}
                      color={notificationType.color as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notificationService.label}
                      color={notificationService.color as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
} 