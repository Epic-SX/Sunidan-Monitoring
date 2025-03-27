export interface Size {
  id: number;
  size: string;
  current_price: number;
  previous_price: number;
  lowest_price: number;
  highest_price: number;
  notify_below: number | null;
  notify_above: number | null;
  notify_on_any_change: boolean;
}

export interface Product {
  id: number;
  name: string;
  image_url: string;
  url: string;
  is_active: boolean;
  sizes: Size[];
} 