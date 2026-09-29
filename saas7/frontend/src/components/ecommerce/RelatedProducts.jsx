import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../api/products';   // ✅ getRelatedProducts-க்கு பதில் getProducts
import ProductCard from '../products/ProductCard';
import { EmptyState } from '../ui/EmptyState';

export const RelatedProducts = ({ productId, categoryId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['related', productId],
    queryFn: async () => {
      const res = await getProducts({ limit: 5 });
      const products = res.data.data?.docs || [];
      // தற்போதைய Product-ஐ தவிர்த்து, மீதி 4-ஐ காட்டு
      return products.filter(p => p._id !== productId).slice(0, 4);
    },
    enabled: !!productId,
  });

  if (isLoading) return <div className="py-4">Loading related...</div>;
  if (!data?.length) return <EmptyState title="No related products" />;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-display font-semibold mb-4">You may also like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};