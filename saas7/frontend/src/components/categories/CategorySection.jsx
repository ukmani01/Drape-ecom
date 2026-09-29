import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../../api/categories';
import { Link, useNavigate } from 'react-router-dom';

const CategorySection = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories().then(res => res.data.data?.docs || []),
        staleTime: 5 * 60 * 1000,
    });

    const categories = data || [];
    const activeCategories = categories.filter(cat => cat.status === 'active');

    if (isLoading) {
        return (
            <section className="category-section">
                <div className="container">
                    <div className="section-head">
                        <h2>Shop by Category</h2>
                    </div>
                    <div className="cat-grid">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton cat-card"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || activeCategories.length === 0) {
        return (
            <section className="category-section text-center py-16">
                <div className="container">
                    <h2 className="page-title">Shop by Category</h2>
                    <p className="text-secondary-500 mt-2">No categories added yet.</p>
                </div>
            </section>
        );
    }

    // Split categories for the editorial layout (Row 1: 3 items, Row 2: 2 items)
    const row1 = activeCategories.slice(0, 3);
    const row2 = activeCategories.slice(3, 5);

    return (
        <section className="category-section">
            <div className="container">
                <div className="section-head left-align">
                    <div>
                        <span className="eyebrow">Discover</span>
                        <h2>Shop by Category</h2>
                    </div>
                    <Link to="/products" className="view-all">View All</Link>
                </div>

                {/* First Row: 3 Cards */}
                {row1.length > 0 && (
                    <div className="cat-grid">
                        {row1.map((category) => (
                            <div 
                                key={category._id} 
                                className="cat-card"
                                onClick={() => navigate(`/products?category=${category._id}`)}
                            >
                                <img src={category.image || '/placeholder.jpg'} alt={category.name} />
                                <div className="cat-overlay">
                                    <span className="cat-subtitle">Collection</span>
                                    <h3 className="cat-title">{category.name}</h3>
                                    <span className="cat-cta">Explore</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Second Row: 2 Cards */}
                {row2.length > 0 && (
                    <div className="cat-grid row2">
                        {row2.map((category) => (
                            <div 
                                key={category._id} 
                                className="cat-card"
                                onClick={() => navigate(`/products?category=${category._id}`)}
                            >
                                <img src={category.image || '/placeholder.jpg'} alt={category.name} />
                                <div className="cat-overlay">
                                    <span className="cat-subtitle">Premium</span>
                                    <h3 className="cat-title">{category.name}</h3>
                                    <span className="cat-cta">Shop Now</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategorySection;