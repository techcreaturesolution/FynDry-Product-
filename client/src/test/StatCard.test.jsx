import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import StatCard from '../components/admin/StatCard';
import { DollarSign } from 'lucide-react';

describe('Admin StatCard Component Tests', () => {
  test('renders title, metric value, and subtitle correctly', () => {
    render(
      <StatCard
        title="Today's Revenue"
        value="₹12,450"
        subtitle="Settled payments today"
        icon={DollarSign}
        variant="emerald"
      />
    );

    expect(screen.getByText("Today's Revenue")).toBeInTheDocument();
    expect(screen.getByText('₹12,450')).toBeInTheDocument();
    expect(screen.getByText('Settled payments today')).toBeInTheDocument();
  });

  test('renders positive trend indicator when provided', () => {
    render(
      <StatCard
        title="Order Volume"
        value="148"
        trend="+14% vs yesterday"
        trendPositive={true}
      />
    );

    expect(screen.getByText('+14% vs yesterday')).toBeInTheDocument();
  });
});
