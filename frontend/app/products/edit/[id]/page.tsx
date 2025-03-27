'use client';

import { ProductEdit } from '@/components/products/Edit';
import { fetchProduct } from '../../actions'

export default async function Page({params}: {params: {id: string}}) {
  const productId = params.id
  const product = await fetchProduct(productId);
  
  return <ProductEdit initialProduct={product} />;
}

