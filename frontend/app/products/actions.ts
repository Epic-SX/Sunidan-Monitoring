'use server'

export async function fetchProduct(productId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${baseUrl}/products/${productId}`);
    
    if (!response.ok) {
      throw new Error(`製品の取得に失敗しました: ${response.statusText}`);
    }
    
    return response.json();
  } 

