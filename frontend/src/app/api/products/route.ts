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

export async function GET() {
  // In a real application, you would fetch data from your Python backend
  // Example:
  // const response = await fetch('http://localhost:5000/api/products');
  // const products = await response.json();
  
  // For now, we'll return mock data
  return NextResponse.json(mockProducts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real application, you would send this data to your Python backend
    // Example:
    // const response = await fetch('http://localhost:5000/api/products', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(body),
    // });
    // const result = await response.json();
    
    // For now, we'll just return a success message
    return NextResponse.json({ success: true, message: '商品を追加しました' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'エラーが発生しました' },
      { status: 500 }
    );
  }
} 