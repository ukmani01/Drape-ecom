import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, removeFromWishlist, clearWishlist } from '../api/wishlist';
import ProductGrid from '../components/products/ProductGrid';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => getWishlist().then(res => res.data.data),
  });
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      toast.success('Removed from wishlist');
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      toast.success('Wishlist cleared');
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const products = data?.products || [];

  if (products.length === 0) {
    return <EmptyState title="Your wishlist is empty" description="Start adding products you love!" />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold">My Wishlist</h1>
        <Button variant="outline" onClick={() => clearMutation.mutate()}>Clear All</Button>
      </div>
      <ProductGrid products={products} />
    </div>
  );
};

export default Wishlist;