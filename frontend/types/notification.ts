export interface NotificationSettings {
  line_enabled: boolean;
  line_token: string;
  line_user_id: string;
  discord_enabled: boolean;
  discord_webhook: string;
  chatwork_enabled: boolean;
  chatwork_token: string;
  chatwork_room_id: string;
}

export const defaultSettings: NotificationSettings = {
  line_enabled: false,
  line_token: '',
  line_user_id: '',
  discord_enabled: false,
  discord_webhook: '',
  chatwork_enabled: false,
  chatwork_token: '',
  chatwork_room_id: ''
}; 