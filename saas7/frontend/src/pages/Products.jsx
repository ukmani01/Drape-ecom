import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products';
import { getCategory } from '../api/categories';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import Button from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import { EmptyState } from '../components/ui/EmptyState';
import { FiFilter } from 'react-icons/fi';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: '',
    sort: 'createdAt:desc',
    priceMin: '',
    priceMax: '',
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Fetch category details if category filter is applied
  const { data: categoryData } = useQuery({
    queryKey: ['category', filters.category],
    queryFn: () => getCategory(filters.category).then(res => res.data.data),
    enabled: !!filters.category,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['products', { ...filters, search: debouncedSearch }],
    queryFn: ({ pageParam = 1 }) =>
      getProducts({ ...filters, search: debouncedSearch, page: pageParam, limit: 12 }).then(res => res.data.data),
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.pages.flatMap((page) => page.docs) || [];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      sort: 'createdAt:desc',
      priceMin: '',
      priceMax: '',
    });
  };

  return (
    <div className="page-products-luxury">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Work+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --ivory: #faf7f1;
          --champagne: #efe4cb;
          --stone: #ded5c3;
          --sand: #c9b898;
          --charcoal: #1c1a16;
          --black: #0d0c0a;
          --gold: #a3763c;
          --ink-soft: #5c584c;
          --ink-faint: #a19b88;
          --line: #e4dcc9;
          --white: #ffffff;
          --serif: 'Cormorant Garamond', serif;
          --sans: 'Work Sans', sans-serif;
          --ease: cubic-bezier(.19,1,.22,1);
        }

        .page-products-luxury {
          font-family: var(--sans);
          background: var(--ivory);
          color: var(--charcoal);
          min-height: 100vh;
          font-weight: 300;
          padding-bottom: 90px;
          -webkit-font-smoothing: antialiased;
        }

        .page-products-luxury .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 64px;
        }

        .page-products-luxury .breadcrumb {
          font-size: 11.5px;
          color: var(--ink-faint);
          padding: 34px 0 0;
          letter-spacing: .6px;
        }
        .page-products-luxury .breadcrumb span {
          color: var(--charcoal);
          font-weight: 500;
        }

        .page-products-luxury h1.products-title {
          font-size: 36px;
          margin: 18px 0 36px;
          font-style: italic;
          font-weight: 400;
          font-family: var(--serif);
          color: var(--black);
        }

        .page-products-luxury .filters-shell {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 60px;
          align-items: start;
        }

        .page-products-luxury .sort-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 36px;
        }
        
        .page-products-luxury .results-count {
          font-size: 12.5px;
          color: var(--ink-faint);
          letter-spacing: .3px;
        }

        /* ===== Category Banner ===== */
        .category-banner {
          position: relative;
          background: var(--charcoal);
          aspect-ratio: 21/7;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .category-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.65) saturate(0.9);
        }
        .category-banner-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 50px;
          color: #fff;
        }
        .category-banner-content h2 {
          font-family: var(--serif);
          font-size: clamp(32px, 4vw, 48px);
          font-style: italic;
          font-weight: 400;
          margin-bottom: 14px;
          color: #fff;
        }
        .category-banner-content p {
          font-size: 14.5px;
          color: #e3ded0;
          max-width: 480px;
          line-height: 1.9;
          font-weight: 300;
        }

        /* ===== External Component Overrides ===== */
        .page-products-luxury aside [class*="bg-white"],
        .page-products-luxury aside [class*="shadow"],
        .page-products-luxury aside [class*="rounded"],
        .page-products-luxury aside [class*="border"] {
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          border: none !important;
        }
        
        .page-products-luxury aside h3,
        .page-products-luxury aside [class*="font-semibold"] {
          font-size: 10.5px !important;
          letter-spacing: 2.4px !important;
          text-transform: uppercase !important;
          font-weight: 600 !important;
          margin-bottom: 20px !important;
          color: var(--charcoal) !important;
          font-family: var(--sans) !important;
        }

        .page-products-luxury aside input[type="text"],
        .page-products-luxury aside input[type="number"],
        .page-products-luxury aside select {
          border: 1px solid var(--line) !important;
          padding: 10px 12px !important;
          font-size: 13px !important;
          background: var(--white) !important;
          border-radius: 0 !important;
        }

        /* Override ProductGrid layout to match reference grid */
        .page-products-luxury .product-grid-wrapper > div {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 50px 34px !important;
        }

        .page-products-luxury .product-grid-wrapper [class*="shadow"],
        .page-products-luxury .product-grid-wrapper [class*="rounded"],
        .page-products-luxury .product-grid-wrapper [class*="bg-white"] {
          box-shadow: none !important;
          border-radius: 0 !important;
          background: transparent !important;
        }

        .page-products-luxury .btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 17px 38px;
          font-size: 11.5px;
          letter-spacing: 2.6px;
          text-transform: uppercase;
          font-weight: 500;
          border-radius: 0;
          border: 1px solid var(--charcoal);
          background: transparent;
          color: var(--charcoal);
          transition: all .5s var(--ease);
          cursor: pointer;
        }
        .page-products-luxury .btn-outline:hover {
          background: var(--charcoal);
          color: var(--ivory);
        }

        .page-products-luxury .mobile-filter-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 500;
          color: var(--charcoal);
          background: transparent;
          border: none;
        }

        /* ===== Responsive ===== */
        @media (max-width: 1100px) {
          .page-products-luxury .container { padding: 0 40px; }
          .page-products-luxury .filters-shell { grid-template-columns: 1fr; }
          .page-products-luxury .product-grid-wrapper > div { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 820px) {
          .page-products-luxury .container { padding: 0 24px; }
          .page-products-luxury .product-grid-wrapper > div { grid-template-columns: repeat(2, 1fr) !important; gap: 28px 16px !important; }
          .category-banner { aspect-ratio: 16/9; }
          .category-banner-content { padding: 0 24px; }
        }
      `}</style>

      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <span>{categoryData ? categoryData.name : 'Products'}</span>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center" style={{ marginTop: '14px' }}>
          <h1 className="products-title" style={{ margin: '0' }}>
            {categoryData ? categoryData.name : 'Products'}
          </h1>
          <button className="mobile-filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter style={{ fontSize: '14px' }} /> Filters
          </button>
        </div>

        {/* Desktop Header */}
        <h1 className="products-title hidden md:block">
          {categoryData ? categoryData.name : 'Products'}
        </h1>

        <div className="filters-shell">
          <aside className={`${showFilters ? 'block' : 'hidden md:block'}`}>
            <ProductFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
          </aside>

          <div>
            <div className="sort-bar">
              <div className="results-count">Showing {data?.pages[0]?.total || 0} products</div>
            </div>

            {/* Category Banner */}
            {categoryData && (
              <div className="category-banner">
                {categoryData.image && (
                  <img src={categoryData.image} alt={categoryData.name} />
                )}
                <div className="category-banner-content">
                  <h2>{categoryData.name}</h2>
                  {categoryData.description && (
                    <p>{categoryData.description}</p>
                  )}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="product-grid-wrapper">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="skeleton h-80 w-full" style={{ background: 'var(--champagne)' }} />
                  ))}
                </div>
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No products found"
                description="Try adjusting your filters or search terms."
                action={<button className="btn-outline" onClick={clearFilters}>Clear Filters</button>}
              />
            ) : (
              <>
                <div className="product-grid-wrapper">
                  <ProductGrid products={products} />
                </div>

                {hasNextPage && (
                  <div className="mt-12 text-center">
                    <button
                      className="btn-outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;