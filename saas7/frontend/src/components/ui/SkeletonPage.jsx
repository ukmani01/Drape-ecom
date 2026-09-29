import React from 'react';
import ContentLoader from 'react-content-loader';

export const SkeletonPage = () => (
  <div className="container mx-auto px-4 py-8">
    <ContentLoader viewBox="0 0 1200 800" speed={2}>
      <rect x="0" y="0" rx="10" ry="10" width="1200" height="400" />
      <rect x="0" y="420" rx="10" ry="10" width="280" height="300" />
      <rect x="300" y="420" rx="10" ry="10" width="280" height="300" />
      <rect x="600" y="420" rx="10" ry="10" width="280" height="300" />
      <rect x="900" y="420" rx="10" ry="10" width="280" height="300" />
    </ContentLoader>
  </div>
);
