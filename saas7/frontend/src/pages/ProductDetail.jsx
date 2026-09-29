import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductBySlug } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import { ProductGallery } from '../components/ecommerce/ProductGallery';
import { RelatedProducts } from '../components/ecommerce/RelatedProducts';
import { ProductShare } from '../components/ecommerce/ProductShare';
import { formatCurrency } from '../utils/helpers';
import { Helmet } from 'react-helmet-async';
// =============================================================
// 🔥 DEFAULT THEME CSS - All Page Styles (Variables + Components)
// =============================================================
import '../themes/default.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { addItem } = useRecentlyViewed();
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug).then(res => res.data.data),
  });

  const addedRef = useRef(null);
  useEffect(() => {
    if (product && product._id !== addedRef.current) {
      addItem(product);
      addedRef.current = product._id;
    }
  }, [product, addItem]);

  if (isLoading) return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;
  if (!product) return <div className="container mx-auto px-4 py-20 text-center">Product not found</div>;

  const handleAddToCart = () => addToCart(product._id, '', 1);
  const price = product.variants[0]?.price || 0;
  const comparePrice = product.variants[0]?.compareAtPrice || 0;
  const discount = comparePrice > 0 ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <div className="page-product-luxury">
      {/* ✅ ALL STYLES ARE NOW IN default.css */}
      {/* ✅ THEME VARIABLES ARE LOADED FROM theme1-10.css */}

      <Helmet>
        <title>{product.title} | Drape</title>
        <meta name="description" content={product.shortDescription || product.description} />
        <meta property="og:title" content={product.title} />
        <meta property="og:image" content={product.images[0]} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.title}</span>
        </div>

        <div className="pd-grid">
          <div className="pd-gallery-override">
            <ProductGallery images={product.images} />
          </div>

          <div className="pd-info">
            <div className="eyebrow">Product Details</div>
            <h1>{product.title}</h1>

            <div className="pd-price">
              {comparePrice > 0 && (
                <span className="was">{formatCurrency(comparePrice)}</span>
              )}
              <span>{formatCurrency(price)}</span>
              {discount > 0 && (
                <span className="discount-tag">Save {discount}%</span>
              )}
            </div>

            <div
              className="pd-desc"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            <div className="pd-actions">
              <button className="btn btn-dark" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <div className="share-override">
                <ProductShare url={window.location.href} title={product.title} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingBottom: '90px' }}>
          <div className="related-override">
            <RelatedProducts productId={product._id} categoryId={product.categoryId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;