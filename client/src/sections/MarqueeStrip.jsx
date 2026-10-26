import React from 'react';
import Marquee from '../components/Marquee';

export default function MarqueeStrip() {
  const marqueeItems = [
    'No Artificial Additives',
    'Naturally Preserved',
    'Easy to Use',
    'Pantry Friendly',
    'Zero Added Oils',
    'Pure Wholesome Goodness',
    'Farm Fresh Harvests',
  ];

  return (
    <section className="bg-primary text-cream relative z-20 shadow-md py-1 border-y border-primary-dark/30">
      <div className="w-full">
        <Marquee items={marqueeItems} speed={30} />
      </div>
    </section>
  );
}
