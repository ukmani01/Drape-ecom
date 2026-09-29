import React from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const ProductFilters = ({ filters, onChange, onClear }) => {
  return (
    <div className="space-y-4">
      <div>
        <Input
          label="Search"
          type="text"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder="Search products..."
        />
      </div>
      <div>
        <Select
          label="Category"
          options={[
            { value: '', label: 'All Categories' },
          ]}
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
        />
      </div>
      <div>
        <Select
          label="Sort"
          options={[
            { value: 'createdAt:desc', label: 'Newest' },
            { value: 'price:asc', label: 'Price: Low to High' },
            { value: 'price:desc', label: 'Price: High to Low' },
            { value: 'totalSales:desc', label: 'Best Selling' },
          ]}
          value={filters.sort}
          onChange={(e) => onChange('sort', e.target.value)}
        />
      </div>
      <div>
        <Input
          label="Min Price"
          type="number"
          value={filters.priceMin}
          onChange={(e) => onChange('priceMin', e.target.value)}
          placeholder="0"
        />
        <Input
          label="Max Price"
          type="number"
          value={filters.priceMax}
          onChange={(e) => onChange('priceMax', e.target.value)}
          placeholder="1000"
        />
      </div>
      <Button variant="outline" size="sm" onClick={onClear} className="w-full">Clear Filters</Button>
    </div>
  );
};

export default ProductFilters;
