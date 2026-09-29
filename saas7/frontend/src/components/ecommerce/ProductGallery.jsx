import React, { useState, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// ✅ Local SVG placeholder (No network call, No performance issue)
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='30' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export const ProductGallery = ({ images }) => {
  const [selected, setSelected] = useState(0);

  // ✅ Safe check: If images is not an array or empty, return placeholder
  const imageList = useMemo(() => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return [PLACEHOLDER_IMAGE];
    }
    return images;
  }, [images]);

  // ✅ Ensure selected index is within bounds
  const safeSelected = selected >= imageList.length ? 0 : selected;
  const mainImage = imageList[safeSelected] || PLACEHOLDER_IMAGE;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 order-2 md:order-1">
        {imageList.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
              safeSelected === idx ? 'border-primary-500' : 'border-transparent'
            }`}
          >
            <img
              src={img || PLACEHOLDER_IMAGE}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy" // ✅ Performance: Lazy load thumbnails
            />
          </button>
        ))}
      </div>

      {/* Main Image with Zoom */}
      <div className="flex-1 order-1 md:order-2">
        {/* ✅ Performance Optimization: Only use zoom if images exist */}
        {imageList.length > 0 ? (
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit
            wheel={{ step: 0.1 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <div className="relative">
                <TransformComponent>
                  <img
                    src={mainImage}
                    alt="Product main view"
                    className="w-full rounded-2xl object-contain bg-white"
                    style={{ maxHeight: '600px' }}
                    loading="eager"
                  />
                </TransformComponent>
                {/* ✅ Zoom controls (Optional - improves UX) */}
                <div className="absolute bottom-4 right-4 flex gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-md">
                  <button
                    onClick={() => zoomIn()}
                    className="px-3 py-1 hover:bg-secondary-100 rounded transition"
                    aria-label="Zoom In"
                  >
                    ➕
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="px-3 py-1 hover:bg-secondary-100 rounded transition"
                    aria-label="Zoom Out"
                  >
                    ➖
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="px-3 py-1 hover:bg-secondary-100 rounded transition"
                    aria-label="Reset Zoom"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </TransformWrapper>
        ) : (
          <img
            src={PLACEHOLDER_IMAGE}
            alt="No product image"
            className="w-full rounded-2xl object-contain"
            style={{ maxHeight: '600px' }}
          />
        )}
      </div>
    </div>
  );
};