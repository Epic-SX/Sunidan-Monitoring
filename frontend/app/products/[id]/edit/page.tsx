import { ProductEdit } from '@/components/products/Edit';

export default async function EditProductPage({ params }: { params: { id: number } }) {
  const productId = params.id;
  const product = await fetchProduct(productId);
  
  return <ProductEdit initialProduct={product} />;
}

async function fetchProduct(productId: number) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const response = await fetch(`${baseUrl}/api/products/${productId}`);
  
  if (!response.ok) {
    throw new Error(`製品の取得に失敗しました: ${response.statusText}`);
  }
  
  return response.json();
} 