import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';

const ProductCard = ({ product }) => {
  return (
    /* Overriding Card default styles with clean-card-override */
    <Card hover className="clean-card-override group">
      <Link to={`/products/${product.slug}`} className="luxury-product-link">
        
        <div className="luxury-product-img-wrap">
          <img
            src={product.images[0] || 'https://via.placeholder.com/300'}
            alt={product.title}
            className="luxury-product-image"
          />
        </div>

        <div className="luxury-product-info">
          <h3 className="luxury-product-title">{product.title}</h3>
          <p className="luxury-product-price">₹{product.variants[0]?.price || 0}</p>
        </div>
        
      </Link>
    </Card>
  );
};

export default ProductCard;