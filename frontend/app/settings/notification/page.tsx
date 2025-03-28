import { NotificationForm } from '@/components/notifications/NotificationForm';
import Typography from '@mui/material/Typography';
import { NotificationSettings, defaultSettings } from '@/types/notification';

async function getNotificationSettings() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${baseUrl}/notifications/settings`);

    if (!response.ok) {
      return defaultSettings;
    }

    return response.json();
  } catch (error) {
    console.error('設定の取得エラー:', error);
    return defaultSettings;
  }
}

export default async function NotificationSettingsPage() {
  const initialSettings = await getNotificationSettings();

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        通知設定
      </Typography>
      <NotificationForm initialSettings={initialSettings} />
    </div>
  );
} 