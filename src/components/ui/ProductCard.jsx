
'use client';

import { Card, CardContent, CardHeader, CardTitle } from './Cards';
import  Button  from './Button';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }) {
  const router = useRouter();
  
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${product.basePrice}</span>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {product.type.replace('-', ' ').toUpperCase()}
          </span>
        </div>
        <Button 
          onClick={() => router.push(`/products/${product._id}`)}
          className="w-full"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
