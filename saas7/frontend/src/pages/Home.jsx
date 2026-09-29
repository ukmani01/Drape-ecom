import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedProducts, getBestSellers, getNewArrivals } from '../api/products';
import { getSettings } from '../api/settings';
import ProductCard from '../components/products/ProductCard';
import CategorySection from '../components/categories/CategorySection';
import { useAuth } from '../contexts/AuthContext';   // ✅ ADDED
import '../themes/default.css';

const Home = () => {
  const { user } = useAuth();   // ✅ ADDED

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings().then(res => res.data.data),
    enabled: !!user,            // ✅ ADDED – only fetch when authenticated
    retry: false,               // ✅ ADDED – no retries on failure
    staleTime: 5 * 60 * 1000,
  });

  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getFeaturedProducts().then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: bestsellers } = useQuery({
    queryKey: ['bestsellers'],
    queryFn: () => getBestSellers().then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: newArrivals } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => getNewArrivals().then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const hero = settings?.hero || {};
  const brand = settings?.brand || {};
  const homepage = settings?.homepage || {};

  const showAllLink = homepage.featuredCategoryId
    ? `/products?category=${homepage.featuredCategoryId}`
    : '/products';

  return (
    <div className="home-luxury-page">

      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero-grid">
          {hero.image ? (
            <img src={hero.image} alt={hero.title || 'Hero'} />
          ) : (
            <div className="w-full h-[80vh] min-h-[520px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-secondary-200 rounded-xl m-5 bg-secondary-50">
              <span className="text-5xl opacity-50">🖼️</span>
              <p className="text-secondary-500 text-sm">No hero image added yet.</p>
              <p className="text-secondary-400 text-xs opacity-70">
                Go to <strong className="text-secondary-600">Settings → Hero Section</strong> to upload an image.
              </p>
            </div>
          )}
          <div className="hero-fade"></div>
          <div className="hero-content">
            {brand.name && (
              <div className="eyebrow on-dark">
                {brand.name} {brand.tagline && `· ${brand.tagline}`}
              </div>
            )}
            <h1>{hero.title || 'Welcome to Our Store'}</h1>
            <p>{hero.description || 'Discover our premium collection.'}</p>
            <div className="hero-btn-row">
              <Link to={hero.buttonLink || '/products'} className="btn btn-accent">
                {hero.buttonText || 'Shop Collection'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DESCRIPTION TEXT */}
      {homepage.aboutText && (
        <section className="py-10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-base md:text-lg text-secondary-600 leading-relaxed">
                {homepage.aboutText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. CATEGORIES SECTION */}
      <CategorySection />

      {/* ==========================================
          BEST SELLERS (Trending Now style)
          ========================================== */}
      <section className="product-showcase-section">
        <div className="container">
          <div className="section-head left-align">
            <div>
              <span className="eyebrow">Shop By Demand</span>
              <h2>Best Sellers</h2>
            </div>
            <Link to="/products" className="view-all">View All</Link>
          </div>
          
          <div className="carousel-wrap">
            <div className="carousel-track snap-scroll">
              {bestsellers?.slice(0, 7).map((product) => (
                <div key={product._id} className="carousel-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          NEW ARRIVALS (Just Landed style)
          ========================================== */}
      <section className="product-showcase-section pt-0">
        <div className="container">
          <div className="section-head left-align">
            <div>
              <span className="eyebrow">Just Landed</span>
              <h2>New Arrivals</h2>
            </div>
            <Link to="/products" className="view-all">View All</Link>
          </div>
          
          <div className="carousel-wrap">
            <div className="carousel-track snap-scroll">
              {newArrivals?.slice(0, 7).map((product) => (
                <div key={product._id} className="carousel-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;