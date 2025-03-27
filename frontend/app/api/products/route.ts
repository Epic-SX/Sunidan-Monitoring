import { NextResponse } from 'next/server';

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

// This is a Next.js API route that will be called by the frontend
// It will proxy the request to the Flask backend
export async function GET() {
  try {
    const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/products`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API error (${response.status}):`, errorData);
      throw new Error(`APIリクエストは${response.status}ステータスで失敗しました。`);
    }
    
    const products = await response.json();
    return NextResponse.json(products);
  } catch (error) {
    console.error('商品の取得に失敗しました:', error);
    // return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    return NextResponse.json(mockProducts);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Use the Next.js proxy to avoid CORS issues
    const response = await fetch('http://localhost:5000/api/products/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // This is important for CORS
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('製品の追加に失敗しました:', error);
    return NextResponse.json(
      { success: false, message: 'エラーが発生しました: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 