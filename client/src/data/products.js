// Product thumbnail images (packaging & label view)
import appleSlicesWebp from '../assets/products/FynDry_Apple_Slices_Wooden_Bowl_Label.webp';
import appleSlicesPng from '../assets/products/FynDry_Apple_Slices_Wooden_Bowl_Label.png';

import bananaBitesWebp from '../assets/products/FynDry_Banana_Bites_Packaging.webp';
import bananaBitesPng from '../assets/products/FynDry_Banana_Bites_Packaging.png';

import instantSoupWebp from '../assets/products/FynDry_Instant_Soup_Powder_Poster.webp';
import instantSoupPng from '../assets/products/FynDry_Instant_Soup_Powder_Poster.png';

import redOnionWebp from '../assets/products/FynDry_Onion_Powder_Spoon_Poster.webp';
import redOnionPng from '../assets/products/FynDry_Onion_Powder_Spoon_Poster.png';

import beetrootWebp from '../assets/products/Beetroot_Powder_Naturally_Preserved.webp';
import beetrootPng from '../assets/products/Beetroot_Powder_Naturally_Preserved.png';

import garlicPowderWebp from '../assets/products/Garlic_Powder_Natural_Goodness_Label.webp';
import garlicPowderPng from '../assets/products/Garlic_Powder_Natural_Goodness_Label.png';

// Product View Details Listing Images (from src/assets/Images)
import appleSlicesListingWebp from '../assets/Images/Apple Slices listing.webp';
import appleSlicesListingPng from '../assets/Images/Apple Slices listing.png';

import bananaBitesListingWebp from '../assets/Images/Banana Bites listing.webp';
import bananaBitesListingPng from '../assets/Images/Banana Bites listing.png';

import beetrootListingWebp from '../assets/Images/Beetroot Powder listing.webp';
import beetrootListingPng from '../assets/Images/Beetroot Powder listing.png';

import garlicListingWebp from '../assets/Images/Garlic Powder listing.webp';
import garlicListingPng from '../assets/Images/Garlic Powder listing.png';

import onionListingWebp from '../assets/Images/Onion Powder listing.webp';
import onionListingPng from '../assets/Images/Onion Powder listing.png';

import soupListingWebp from '../assets/Images/Soup powder listing.webp';
import soupListingPng from '../assets/Images/Soup powder listing.png';

export const products = [
  {
    id: 'prod-apple-slices',
    name: 'Apple Slices',
    slug: 'apple-slices',
    tagline: 'A Little Apple Goodness in Every Bite.',
    highlights: [
      'Naturally sweet apple flavour',
      'Convenient fruit snacking',
      'No oil added',
      'Ideal for cereals, baking and travel',
    ],
    image: appleSlicesWebp,
    imageFallback: appleSlicesPng,
    detailImage: appleSlicesListingWebp,
    detailImageFallback: appleSlicesListingPng,
    accentColor: '#D62828',
    category: 'fruit-snack',
    order: 1,
    description: 'Crisp, naturally sun-kissed dehydrated apple slices bursting with orchard freshness. Never fried, never oily — just pure sliced apples gently preserved to retain crispness and natural nutrients.',
    servingSuggestions: ['Yogurt bowls & oatmeal', 'Lunchbox snack packs', 'Homemade granola', 'Light tea-time crunch'],
    weight: '100g / 250g',
    nutritionHighlights: ['0g Added Sugar', '100% Real Apple', 'High Dietary Fiber'],
  },
  {
    id: 'prod-banana-bites',
    name: 'Banana Bites',
    slug: 'banana-bites',
    tagline: 'Naturally Sweet. Simply Banana.',
    highlights: [
      'Banana flavour in a convenient format',
      'No oil added',
      'Easy to carry and enjoy',
      'Suitable for cereals and recipes',
    ],
    image: bananaBitesWebp,
    imageFallback: bananaBitesPng,
    detailImage: bananaBitesListingWebp,
    detailImageFallback: bananaBitesListingPng,
    accentColor: '#F2B705',
    category: 'fruit-snack',
    order: 2,
    description: 'Sun-ripened bananas dehydrated to bite-sized chewy perfection. Golden, sweet, and packed with wholesome potassium without added sugars or preservatives.',
    servingSuggestions: ['Post-workout energy boost', 'Smoothie bowl topping', 'Baking & pancake batter', 'Kids healthy snack'],
    weight: '100g / 200g',
    nutritionHighlights: ['Rich in Potassium', 'No Added Fats', 'Natural Energy'],
  },
  {
    id: 'prod-instant-soup',
    name: 'Instant Soup',
    slug: 'instant-soup',
    tagline: 'Comfort in a Cup. Ready in Minutes.',
    highlights: [
      'Convenient preparation',
      'Easy pantry storage',
      'Suitable for work and home',
      'Clear preparation instructions',
    ],
    image: instantSoupWebp,
    imageFallback: instantSoupPng,
    detailImage: soupListingWebp,
    detailImageFallback: soupListingPng,
    accentColor: '#C62828',
    category: 'instant',
    order: 3,
    description: 'A comforting, savory blend of farm-fresh dehydrated vegetables and aromatic herbs. Just add steaming hot water for a hearty, restorative cup in under three minutes.',
    servingSuggestions: ['Office lunch companion', 'Late-night cozy mug', 'Travel & camping warmth', 'Pre-meal appetizer'],
    weight: '6 Servings / Box',
    nutritionHighlights: ['Ready in 3 Min', 'Garden Herbs', 'Pantry Friendly'],
  },
  {
    id: 'prod-red-onion-powder',
    name: 'Red Onion Powder',
    slug: 'red-onion-powder',
    tagline: 'Onion Flavour. Less Prep.',
    highlights: [
      'Convenient alternative to chopping onions',
      'Easy to mix into sauces and gravies',
      'Useful for marinades and seasonings',
      'Store sealed to protect aroma',
    ],
    image: redOnionWebp,
    imageFallback: redOnionPng,
    detailImage: onionListingWebp,
    detailImageFallback: onionListingPng,
    accentColor: '#A3195B',
    category: 'powder',
    order: 4,
    description: 'Pure dehydrated red onion ground into a velvety, potent culinary powder. Skip the tears and slicing while infusing deep savory sweetness into every simmering dish.',
    servingSuggestions: ['Curries & gravies', 'Barbecue dry rubs', 'Dip & dressing bases', 'Soup & broth seasoning'],
    weight: '150g Jar',
    nutritionHighlights: ['Zero Prep Tears', 'Deep Aroma', 'Even Dissolving'],
  },
  {
    id: 'prod-beetroot-powder',
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    tagline: 'Colour Your Creations Naturally.',
    highlights: [
      'Distinctive beetroot colour',
      'Fine powder for easy mixing',
      'Useful in smoothies, soups and baking',
      'Convenient pantry ingredient',
    ],
    image: beetrootWebp,
    imageFallback: beetrootPng,
    detailImage: beetrootListingWebp,
    detailImageFallback: beetrootListingPng,
    accentColor: '#9B1239',
    category: 'powder',
    order: 5,
    description: 'Vibrant ruby-red powder milled from prime harvest beetroots. Adds spectacular natural food coloring, earthy richness, and potent plant antioxidants to doughs, drinks, and batters.',
    servingSuggestions: ['Velvety pink lattes', 'Red velvet cakes & pasta', 'Pre-workout booster drinks', 'Hummus & dip tinting'],
    weight: '150g Jar',
    nutritionHighlights: ['Natural Pigment', 'Antioxidant Rich', 'Fine Silky Mesh'],
  },
  {
    id: 'prod-garlic-powder',
    name: 'Garlic Powder',
    slug: 'garlic-powder',
    tagline: 'Big Garlic Flavour. Less Prep.',
    highlights: [
      'Convenient garlic flavour',
      'No peeling or chopping',
      'Ideal for soups, sauces and marinades',
      'Easy to measure and store',
    ],
    image: garlicPowderWebp,
    imageFallback: garlicPowderPng,
    detailImage: garlicListingWebp,
    detailImageFallback: garlicListingPng,
    accentColor: '#E8890C',
    category: 'powder',
    order: 6,
    description: 'Gently dehydrated, aromatic garlic cloves ground into fine aromatic crystals. Delivers mouthwatering punch to roasted veggies, garlic breads, pastas, and roasts with zero sticky peeling.',
    servingSuggestions: ['Herb garlic butter', 'Roast potatoes & veggies', 'Pizza & pasta sprinkle', 'Meat & paneer marinades'],
    weight: '150g Jar',
    nutritionHighlights: ['No Peeling Mess', 'Pungent Aroma', 'Long Shelf Life'],
  },
];

export const categories = [
  { id: 'all', label: 'All Products', count: 6 },
  { id: 'fruit-snack', label: 'Fruit Snacks', count: 2 },
  { id: 'powder', label: 'Powders', count: 3 },
  { id: 'instant', label: 'Instant', count: 1 },
];
