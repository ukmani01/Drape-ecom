import React from 'react';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import ProductGrid from '../components/products/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const RecentlyViewed = () => {
  const { items, clearAll } = useRecentlyViewed();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState title="No recently viewed items" description="Start browsing products!" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold">Recently Viewed</h1>
        <Button variant="outline" size="sm" onClick={clearAll}>Clear All</Button>
      </div>
      <ProductGrid products={items} />
    </div>
  );
};

export default RecentlyViewed;
