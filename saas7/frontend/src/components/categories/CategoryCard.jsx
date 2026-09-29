import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
    // ✅ Safe check – if category is undefined/null, return nothing
    if (!category) {
        console.warn('CategoryCard: category is undefined');
        return null;
    }

    const { name, slug, description, image } = category;

    // Auto-detect category type label
    const getCategoryLabel = () => {
        const lower = name.toLowerCase();
        if (lower.includes('men') || lower.includes('male')) return "Men's Wear";
        if (lower.includes('women') || lower.includes('female') || lower.includes('woman')) return "Women's Wear";
        if (lower.includes('accessories')) return 'Accessories';
        if (lower.includes('kids') || lower.includes('children') || lower.includes('baby')) return "Kids' Wear";
        if (lower.includes('shoes') || lower.includes('footwear')) return 'Footwear';
        if (lower.includes('bags') || lower.includes('backpack')) return 'Bags & Luggage';
        return 'Collection';
    };

    return (
        <Link
            to={`/products?category=${slug}`}
            className="group relative block overflow-hidden rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all duration-500 ease-out h-full"
        >
            {/* Background Image */}
            <div className="aspect-[4/3] w-full overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-secondary-200 to-secondary-300" />
                )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/50" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                {/* Category Label */}
                <span className="inline-block text-[10px] md:text-xs font-medium uppercase tracking-wider text-primary-300 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
                    {getCategoryLabel()}
                </span>

                {/* Category Name */}
                <h3 className="text-xl md:text-2xl font-display font-bold tracking-tight group-hover:text-primary-300 transition-colors duration-300 line-clamp-1">
                    {name}
                </h3>

                {/* Description */}
                {description && (
                    <p className="mt-1 text-xs md:text-sm text-white/80 line-clamp-2 max-w-xs">
                        {description}
                    </p>
                )}

                {/* Shop Now */}
                <div className="mt-2 md:mt-3 flex items-center gap-2 text-xs md:text-sm font-medium text-white/90 group-hover:text-primary-300 transition-colors duration-300">
                    Shop Collection
                    <svg
                        className="h-3 w-3 md:h-4 md:w-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </Link>
    );
};

export default CategoryCard;