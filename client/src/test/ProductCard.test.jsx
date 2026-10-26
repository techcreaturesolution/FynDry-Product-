import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import ProductCard from '../components/ProductCard';

const mockProduct = {
  _id: 'prod_123',
  name: 'Crisp Apple Slices',
  tagline: 'Naturally Sweet & Crisp',
  slug: 'crisp-apple-slices',
  category: { name: 'Fruit Snacks', slug: 'fruit-snacks' },
  accentColor: '#1F6B3A',
  images: [{ url: '/assets/products/apple.webp' }],
  variants: [
    { label: '100g', price: 189, mrp: 249, stock: 40 },
    { label: '250g', price: 399, mrp: 499, stock: 20 },
  ],
  isActive: true,
  ratingAvg: 4.9,
  ratingCount: 18,
};

describe('Storefront ProductCard Component Tests', () => {
  test('renders product name, tagline, and lowest variant starting price', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    expect(screen.getByText('Crisp Apple Slices')).toBeInTheDocument();
    expect(screen.getByText('Naturally Sweet & Crisp')).toBeInTheDocument();
    expect(screen.getByText('₹189')).toBeInTheDocument();
    expect(screen.getByText('₹249')).toBeInTheDocument(); // MRP
  });

  test('displays out-of-stock badge when all variants have zero stock', () => {
    const outOfStockProduct = {
      ...mockProduct,
      variants: [
        { label: '100g', price: 189, stock: 0 },
        { label: '250g', price: 399, stock: 0 },
      ],
    };

    render(
      <BrowserRouter>
        <ProductCard product={outOfStockProduct} />
      </BrowserRouter>
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});
