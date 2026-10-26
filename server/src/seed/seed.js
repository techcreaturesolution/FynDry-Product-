import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyndry';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@fyndry.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

export const seedCategoriesData = [
  {
    name: 'Fruit Snacks',
    slug: 'fruit-snacks',
    description: 'Crisp, sun-kissed dehydrated real fruits with zero oil, zero preservatives, and natural crunch.',
    image: '/assets/products/FynDry_Apple_Slices_Wooden_Bowl_Label.webp',
    order: 1,
    isActive: true,
  },
  {
    name: 'Powders',
    slug: 'powders',
    description: 'Pure, single-ingredient gourmet culinary powders crafted from prime farm harvests.',
    image: '/assets/products/FynDry_Onion_Powder_Spoon_Poster.webp',
    order: 2,
    isActive: true,
  },
  {
    name: 'Instant',
    slug: 'instant',
    description: 'Nourishing dehydrated vegetable blends ready in hot water in minutes.',
    image: '/assets/products/FynDry_Instant_Soup_Powder_Poster.webp',
    order: 3,
    isActive: true,
  },
];

export const seedProductsData = [
  {
    name: 'Apple Slices',
    slug: 'apple-slices',
    tagline: 'A Little Apple Goodness in Every Bite.',
    categorySlug: 'fruit-snacks',
    shortDescription: 'Crisp, naturally sun-kissed dehydrated apple slices with zero added oil.',
    description:
      'Crisp, naturally sun-kissed dehydrated apple slices bursting with orchard freshness. Never fried, never oily — just pure sliced apples gently preserved to retain crispness and natural nutrients.',
    highlights: [
      'Naturally sweet apple flavour',
      'Convenient fruit snacking',
      'No oil added',
      'Ideal for cereals, baking and travel',
    ],
    accentColor: '#D62828',
    variants: [
      {
        label: '100g',
        weightInGrams: 100,
        price: 249,
        mrp: 299,
        stock: 65,
        sku: 'FYN-APP-100',
      },
      {
        label: '250g',
        weightInGrams: 250,
        price: 549,
        mrp: 649,
        stock: 40,
        sku: 'FYN-APP-250',
      },
    ],
    images: [
      {
        url: '/assets/products/FynDry_Apple_Slices_Wooden_Bowl_Label.webp',
        publicId: 'local-apple-slices-1',
      },
      {
        url: '/assets/Images/Apple Slices listing.webp',
        publicId: 'local-apple-slices-2',
      },
    ],
    tags: ['fruit', 'snack', 'apple', 'healthy', 'oil-free'],
    ingredients: '100% Real Dehydrated Apples',
    shelfLife: '12 Months',
    storageInstructions: 'Store in a cool, dry place. Seal zip pouch tightly after opening.',
    isFeatured: true,
    order: 1,
    isActive: true,
  },
  {
    name: 'Banana Bites',
    slug: 'banana-bites',
    tagline: 'Naturally Sweet. Simply Banana.',
    categorySlug: 'fruit-snacks',
    shortDescription: 'Golden, chewy banana bites packed with wholesome potassium and energy.',
    description:
      'Sun-ripened bananas dehydrated to bite-sized chewy perfection. Golden, sweet, and packed with wholesome potassium without added sugars or preservatives.',
    highlights: [
      'Banana flavour in a convenient format',
      'No oil added',
      'Easy to carry and enjoy',
      'Suitable for cereals and recipes',
    ],
    accentColor: '#F2B705',
    variants: [
      {
        label: '100g',
        weightInGrams: 100,
        price: 199,
        mrp: 249,
        stock: 80,
        sku: 'FYN-BAN-100',
      },
      {
        label: '250g',
        weightInGrams: 250,
        price: 449,
        mrp: 549,
        stock: 50,
        sku: 'FYN-BAN-250',
      },
    ],
    images: [
      {
        url: '/assets/products/FynDry_Banana_Bites_Packaging.webp',
        publicId: 'local-banana-bites-1',
      },
      {
        url: '/assets/Images/Banana Bites listing.webp',
        publicId: 'local-banana-bites-2',
      },
    ],
    tags: ['fruit', 'snack', 'banana', 'potassium', 'energy'],
    ingredients: '100% Sun-Ripened Dehydrated Bananas',
    shelfLife: '12 Months',
    storageInstructions: 'Store in a cool, dry place. Seal tightly after opening.',
    isFeatured: true,
    order: 2,
    isActive: true,
  },
  {
    name: 'Instant Soup',
    slug: 'instant-soup',
    tagline: 'Comfort in a Cup. Ready in Minutes.',
    categorySlug: 'instant',
    shortDescription: 'Garden vegetables and aromatic herbs ready in steaming water in 3 minutes.',
    description:
      'A comforting, savory blend of farm-fresh dehydrated vegetables and aromatic herbs. Just add steaming hot water for a hearty, restorative cup in under three minutes.',
    highlights: [
      'Convenient preparation',
      'Easy pantry storage',
      'Suitable for work and home',
      'Clear preparation instructions',
    ],
    accentColor: '#C62828',
    variants: [
      {
        label: '100g',
        weightInGrams: 100,
        price: 299,
        mrp: 349,
        stock: 45,
        sku: 'FYN-SOP-100',
      },
      {
        label: '250g',
        weightInGrams: 250,
        price: 649,
        mrp: 749,
        stock: 30,
        sku: 'FYN-SOP-250',
      },
    ],
    images: [
      {
        url: '/assets/products/FynDry_Instant_Soup_Powder_Poster.webp',
        publicId: 'local-instant-soup-1',
      },
      {
        url: '/assets/Images/Soup powder listing.webp',
        publicId: 'local-instant-soup-2',
      },
    ],
    tags: ['instant', 'soup', 'comfort', 'warmth', 'vegetables'],
    ingredients: 'Dehydrated Carrots, Beans, Sweet Corn, Cabbage, Onion, Garlic, Herbs & Spices',
    shelfLife: '12 Months',
    storageInstructions: 'Store sealed in a dry ambient pantry.',
    isFeatured: true,
    order: 3,
    isActive: true,
  },
  {
    name: 'Red Onion Powder',
    slug: 'red-onion-powder',
    tagline: 'Onion Flavour. Less Prep.',
    categorySlug: 'powders',
    shortDescription: 'Pure dehydrated red onion ground into a velvety, pungent seasoning powder.',
    description:
      'Pure dehydrated red onion ground into a velvety, potent culinary powder. Skip the tears and slicing while infusing deep savory sweetness into every simmering dish.',
    highlights: [
      'Convenient alternative to chopping onions',
      'Easy to mix into sauces and gravies',
      'Useful for marinades and seasonings',
      'Store sealed to protect aroma',
    ],
    accentColor: '#A3195B',
    variants: [
      {
        label: '100g',
        weightInGrams: 100,
        price: 179,
        mrp: 220,
        stock: 90,
        sku: 'FYN-ONI-100',
      },
      {
        label: '250g',
        weightInGrams: 250,
        price: 399,
        mrp: 480,
        stock: 60,
        sku: 'FYN-ONI-250',
      },
    ],
    images: [
      {
        url: '/assets/products/FynDry_Onion_Powder_Spoon_Poster.webp',
        publicId: 'local-red-onion-1',
      },
      {
        url: '/assets/Images/Onion Powder listing.webp',
        publicId: 'local-red-onion-2',
      },
    ],
    tags: ['powder', 'seasoning', 'onion', 'pantry', 'cooking'],
    ingredients: '100% Pure Dehydrated Red Onions',
    shelfLife: '12 Months',
    storageInstructions: 'Keep tightly sealed in a dry place to prevent clumping.',
    isFeatured: false,
    order: 4,
    isActive: true,
  },
  {
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    tagline: 'Colour Your Creations Naturally.',
    categorySlug: 'powders',
    shortDescription: 'Vibrant ruby-red plant pigment and antioxidant-packed culinary powder.',
    description:
      'Vibrant ruby-red powder milled from prime harvest beetroots. Adds spectacular natural food coloring, earthy richness, and potent plant antioxidants to doughs, drinks, and batters.',
    highlights: [
      'Distinctive beetroot colour',
      'Fine powder for easy mixing',
      'Useful in smoothies, soups and baking',
      'Convenient pantry ingredient',
    ],
    accentColor: '#9B1239',
    variants: [
      {
        label: '100g',
        weightInGrams: 100,
        price: 269,
        mrp: 310,
        stock: 55,
        sku: 'FYN-BEE-100',
      },
      {
        label: '250g',
        weightInGrams: 250,
        price: 589,
        mrp: 680,
        stock: 35,
        sku: 'FYN-BEE-250',
      },
    ],
    images: [
      {
        url: '/assets/products/Beetroot_Powder_Naturally_Preserved.webp',
        publicId: 'local-beetroot-1',
      },
      {
        url: '/assets/Images/Beetroot Powder listing.webp',
        publicId: 'local-beetroot-2',
      },
    ],
    tags: ['powder', 'superfood', 'beetroot', 'natural color', 'antioxidants'],
    ingredients: '100% Dehydrated Prime Beetroots',
    shelfLife: '12 Months',
    storageInstructions: 'Store in an airtight jar away from direct sunlight.',
    isFeatured: false,
    order: 5,
    isActive: true,
  },
  {
    name: 'Garlic Powder',
    slug: 'garlic-powder',
    tagline: 'Big Garlic Flavour. Less Prep.',
    categorySlug: 'powders',
    shortDescription: 'Aromatic garlic crystals for roasted dishes, breads, and marinades without peeling.',
    description:
      'Gently dehydrated, aromatic garlic cloves ground into fine aromatic crystals. Delivers mouthwatering punch to roasted veggies, garlic breads, pastas, and roasts with zero sticky peeling.',
    highlights: [
      'Convenient garlic flavour',
      'No peeling or chopping',
      'Ideal for soups, sauces and marinades',
      'Easy to measure and store',
    ],
    accentColor: '#E8890C',
    variants: [
      {
        label: '100g',
        weightInGrams: 100,
        price: 189,
        mrp: 230,
        stock: 75,
        sku: 'FYN-GAR-100',
      },
      {
        label: '250g',
        weightInGrams: 250,
        price: 419,
        mrp: 499,
        stock: 45,
        sku: 'FYN-GAR-250',
      },
    ],
    images: [
      {
        url: '/assets/products/Garlic_Powder_Natural_Goodness_Label.webp',
        publicId: 'local-garlic-1',
      },
      {
        url: '/assets/Images/Garlic Powder listing.webp',
        publicId: 'local-garlic-2',
      },
    ],
    tags: ['powder', 'garlic', 'seasoning', 'aroma', 'culinary'],
    ingredients: '100% Dehydrated Farm Garlic Cloves',
    shelfLife: '12 Months',
    storageInstructions: 'Store tightly capped in a dry, cool cabinet.',
    isFeatured: false,
    order: 6,
    isActive: true,
  },
];

export const seedCatalog = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to database successfully.');

    // 1. Idempotently Seed Admin User
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (admin) {
      console.log(`[Seed] Admin user verified (${ADMIN_EMAIL}).`);
      admin.role = 'admin';
      admin.isActive = true;
      admin.passwordHash = ADMIN_PASSWORD;
      await admin.save();
    } else {
      console.log(`[Seed] Creating admin user: ${ADMIN_EMAIL}...`);
      admin = await User.create({
        name: 'FynDry Admin',
        email: ADMIN_EMAIL,
        passwordHash: ADMIN_PASSWORD,
        role: 'admin',
        isActive: true,
      });
      console.log(`[Seed] Created Admin user: ${ADMIN_EMAIL}`);
    }

    // 2. Idempotently Seed Categories
    const categoryMap = {};
    for (const catData of seedCategoriesData) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = await Category.create(catData);
        console.log(`[Seed] Created Category: ${category.name} (${category.slug})`);
      } else {
        Object.assign(category, catData);
        await category.save();
        console.log(`[Seed] Updated Category: ${category.name}`);
      }
      categoryMap[category.slug] = category._id;
    }

    // 3. Clear and Re-seed the 6 FynDry Products with full Phase 2 schema
    await Product.deleteMany({});
    console.log('[Seed] Refreshing Product catalog with Phase 2 models...');

    for (const prodData of seedProductsData) {
      const categoryId = categoryMap[prodData.categorySlug];
      const { categorySlug, ...rest } = prodData;

      const product = await Product.create({
        ...rest,
        category: categoryId,
        vendor: admin._id,
      });
      console.log(`[Seed] Seeded Product: ${product.name} (Min Price: ₹${product.minPrice}, InStock: ${product.inStock})`);
    }

    console.log(`[Seed] Successfully seeded ${seedProductsData.length} products and ${seedCategoriesData.length} categories!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Execute if run directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  seedCatalog();
}
