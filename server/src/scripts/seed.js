import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyndry';

const seedProducts = [
  {
    name: 'Apple Slices',
    slug: 'apple-slices',
    tagline: 'A Little Apple Goodness in Every Bite.',
    category: 'fruit-snack',
    description:
      'Crisp, naturally sun-kissed dehydrated apple slices bursting with orchard freshness. Never fried, never oily — just pure sliced apples gently preserved to retain crispness and natural nutrients.',
    highlights: [
      'Naturally sweet apple flavour',
      'Convenient fruit snacking',
      'No oil added',
      'Ideal for cereals, baking and travel',
    ],
    servingSuggestions: [
      'Yogurt bowls & oatmeal',
      'Lunchbox snack packs',
      'Homemade granola',
      'Light tea-time crunch',
    ],
    nutritionHighlights: ['0g Added Sugar', '100% Real Apple', 'High Dietary Fiber'],
    weight: '100g / 250g',
    price: 249,
    originalPrice: 299,
    stock: 65,
    image: '/assets/products/FynDry_Apple_Slices_Wooden_Bowl_Label.webp',
    imageFallback: '/assets/products/FynDry_Apple_Slices_Wooden_Bowl_Label.png',
    detailImage: '/assets/Images/Apple Slices listing.webp',
    detailImageFallback: '/assets/Images/Apple Slices listing.png',
    accentColor: '#D62828',
    order: 1,
    isActive: true,
  },
  {
    name: 'Banana Bites',
    slug: 'banana-bites',
    tagline: 'Naturally Sweet. Simply Banana.',
    category: 'fruit-snack',
    description:
      'Sun-ripened bananas dehydrated to bite-sized chewy perfection. Golden, sweet, and packed with wholesome potassium without added sugars or preservatives.',
    highlights: [
      'Banana flavour in a convenient format',
      'No oil added',
      'Easy to carry and enjoy',
      'Suitable for cereals and recipes',
    ],
    servingSuggestions: [
      'Post-workout energy boost',
      'Smoothie bowl topping',
      'Baking & pancake batter',
      'Kids healthy snack',
    ],
    nutritionHighlights: ['Rich in Potassium', 'No Added Fats', 'Natural Energy'],
    weight: '100g / 200g',
    price: 199,
    originalPrice: 249,
    stock: 80,
    image: '/assets/products/FynDry_Banana_Bites_Packaging.webp',
    imageFallback: '/assets/products/FynDry_Banana_Bites_Packaging.png',
    detailImage: '/assets/Images/Banana Bites listing.webp',
    detailImageFallback: '/assets/Images/Banana Bites listing.png',
    accentColor: '#F2B705',
    order: 2,
    isActive: true,
  },
  {
    name: 'Instant Soup',
    slug: 'instant-soup',
    tagline: 'Comfort in a Cup. Ready in Minutes.',
    category: 'instant',
    description:
      'A comforting, savory blend of farm-fresh dehydrated vegetables and aromatic herbs. Just add steaming hot water for a hearty, restorative cup in under three minutes.',
    highlights: [
      'Convenient preparation',
      'Easy pantry storage',
      'Suitable for work and home',
      'Clear preparation instructions',
    ],
    servingSuggestions: [
      'Office lunch companion',
      'Late-night cozy mug',
      'Travel & camping warmth',
      'Pre-meal appetizer',
    ],
    nutritionHighlights: ['Ready in 3 Min', 'Garden Herbs', 'Pantry Friendly'],
    weight: '6 Servings / Box',
    price: 299,
    originalPrice: 349,
    stock: 45,
    image: '/assets/products/FynDry_Instant_Soup_Powder_Poster.webp',
    imageFallback: '/assets/products/FynDry_Instant_Soup_Powder_Poster.png',
    detailImage: '/assets/Images/Soup powder listing.webp',
    detailImageFallback: '/assets/Images/Soup powder listing.png',
    accentColor: '#C62828',
    order: 3,
    isActive: true,
  },
  {
    name: 'Red Onion Powder',
    slug: 'red-onion-powder',
    tagline: 'Onion Flavour. Less Prep.',
    category: 'powder',
    description:
      'Pure dehydrated red onion ground into a velvety, potent culinary powder. Skip the tears and slicing while infusing deep savory sweetness into every simmering dish.',
    highlights: [
      'Convenient alternative to chopping onions',
      'Easy to mix into sauces and gravies',
      'Useful for marinades and seasonings',
      'Store sealed to protect aroma',
    ],
    servingSuggestions: [
      'Curries & gravies',
      'Barbecue dry rubs',
      'Dip & dressing bases',
      'Soup & broth seasoning',
    ],
    nutritionHighlights: ['Zero Prep Tears', 'Deep Aroma', 'Even Dissolving'],
    weight: '150g Jar',
    price: 179,
    originalPrice: 220,
    stock: 90,
    image: '/assets/products/FynDry_Onion_Powder_Spoon_Poster.webp',
    imageFallback: '/assets/products/FynDry_Onion_Powder_Spoon_Poster.png',
    detailImage: '/assets/Images/Onion Powder listing.webp',
    detailImageFallback: '/assets/Images/Onion Powder listing.png',
    accentColor: '#A3195B',
    order: 4,
    isActive: true,
  },
  {
    name: 'Beetroot Powder',
    slug: 'beetroot-powder',
    tagline: 'Colour Your Creations Naturally.',
    category: 'powder',
    description:
      'Vibrant ruby-red powder milled from prime harvest beetroots. Adds spectacular natural food coloring, earthy richness, and potent plant antioxidants to doughs, drinks, and batters.',
    highlights: [
      'Distinctive beetroot colour',
      'Fine powder for easy mixing',
      'Useful in smoothies, soups and baking',
      'Convenient pantry ingredient',
    ],
    servingSuggestions: [
      'Velvety pink lattes',
      'Red velvet cakes & pasta',
      'Pre-workout booster drinks',
      'Hummus & dip tinting',
    ],
    nutritionHighlights: ['Natural Pigment', 'Antioxidant Rich', 'Fine Silky Mesh'],
    weight: '150g Jar',
    price: 269,
    originalPrice: 310,
    stock: 55,
    image: '/assets/products/Beetroot_Powder_Naturally_Preserved.webp',
    imageFallback: '/assets/products/Beetroot_Powder_Naturally_Preserved.png',
    detailImage: '/assets/Images/Beetroot Powder listing.webp',
    detailImageFallback: '/assets/Images/Beetroot Powder listing.png',
    accentColor: '#9B1239',
    order: 5,
    isActive: true,
  },
  {
    name: 'Garlic Powder',
    slug: 'garlic-powder',
    tagline: 'Big Garlic Flavour. Less Prep.',
    category: 'powder',
    description:
      'Gently dehydrated, aromatic garlic cloves ground into fine aromatic crystals. Delivers mouthwatering punch to roasted veggies, garlic breads, pastas, and roasts with zero sticky peeling.',
    highlights: [
      'Convenient garlic flavour',
      'No peeling or chopping',
      'Ideal for soups, sauces and marinades',
      'Easy to measure and store',
    ],
    servingSuggestions: [
      'Herb garlic butter',
      'Roast potatoes & veggies',
      'Pizza & pasta sprinkle',
      'Meat & paneer marinades',
    ],
    nutritionHighlights: ['No Peeling Mess', 'Pungent Aroma', 'Long Shelf Life'],
    weight: '150g Jar',
    price: 189,
    originalPrice: 230,
    stock: 75,
    image: '/assets/products/Garlic_Powder_Natural_Goodness_Label.webp',
    imageFallback: '/assets/products/Garlic_Powder_Natural_Goodness_Label.png',
    detailImage: '/assets/Images/Garlic Powder listing.webp',
    detailImageFallback: '/assets/Images/Garlic Powder listing.png',
    accentColor: '#E8890C',
    order: 6,
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB database:', MONGO_URI);

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
    ]);
    console.log('[Seed] Cleared existing Users, Products, Carts, and Orders.');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'FynDry Admin',
      email: 'admin@fyndry.com',
      password: 'AdminPassword123!',
      role: 'admin',
      addresses: [
        {
          fullName: 'FynDry Central Hub',
          phone: '9820011223',
          street: 'Unit 102, Agri-Food Tech Park, Andheri East',
          landmark: 'Opposite Metro Gate 3',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400069',
          country: 'India',
          isDefault: true,
          location: {
            type: 'Point',
            coordinates: [72.8697, 19.1136],
          },
          formattedAddress: 'Unit 102, Agri-Food Tech Park, Andheri East, Mumbai, Maharashtra 400069',
        },
      ],
    });
    console.log('[Seed] Created Admin: admin@fyndry.com / AdminPassword123!');

    // 2. Create Demo Customer User
    const customerUser = await User.create({
      name: 'Radhe Sharma',
      email: 'customer@fyndry.com',
      password: 'CustomerPassword123!',
      role: 'customer',
      addresses: [
        {
          fullName: 'Radhe Sharma',
          phone: '9876543210',
          street: 'B-404, Sea Green Towers, Bandra West',
          landmark: 'Near Carter Road Promenade',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
          isDefault: true,
          location: {
            type: 'Point',
            coordinates: [72.8258, 19.0596],
          },
          formattedAddress:
            'B-404, Sea Green Towers, Bandra West, Mumbai, Maharashtra 400050',
        },
        {
          fullName: 'Radhe Sharma (Office)',
          phone: '9876543210',
          street: '6th Floor, Synergy Business Park, Goregaon East',
          landmark: 'Near Western Express Highway',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400063',
          country: 'India',
          isDefault: false,
          location: {
            type: 'Point',
            coordinates: [72.8656, 19.1663],
          },
          formattedAddress:
            '6th Floor, Synergy Business Park, Goregaon East, Mumbai, Maharashtra 400063',
        },
      ],
    });
    console.log('[Seed] Created Customer: customer@fyndry.com / CustomerPassword123!');

    // 3. Seed Products (assign admin as vendor)
    const productsWithVendor = seedProducts.map((p) => ({
      ...p,
      vendor: adminUser._id,
    }));
    const createdProducts = await Product.insertMany(productsWithVendor);
    console.log(`[Seed] Successfully inserted ${createdProducts.length} FynDry products.`);

    // 4. Seed initial Demo Order for Customer
    const sampleProduct1 = createdProducts[0]; // Apple Slices (₹249)
    const sampleProduct2 = createdProducts[3]; // Onion Powder (₹179)

    const itemsPrice = sampleProduct1.price * 2 + sampleProduct2.price * 1; // 498 + 179 = 677
    const shippingPrice = itemsPrice >= 499 ? 0 : 49;
    const totalPrice = itemsPrice + shippingPrice;

    await Order.create({
      user: customerUser._id,
      orderNumber: `FYN-${Date.now().toString().slice(-6)}-101`,
      orderItems: [
        {
          product: sampleProduct1._id,
          name: sampleProduct1.name,
          price: sampleProduct1.price,
          quantity: 2,
          image: sampleProduct1.image,
          weight: sampleProduct1.weight,
        },
        {
          product: sampleProduct2._id,
          name: sampleProduct2.name,
          price: sampleProduct2.price,
          quantity: 1,
          image: sampleProduct2.image,
          weight: sampleProduct2.weight,
        },
      ],
      shippingAddress: customerUser.addresses[0],
      paymentMethod: 'razorpay',
      paymentResult: {
        razorpay_order_id: 'rzp_order_seed_sample_101',
        razorpay_payment_id: 'pay_sample_verified_202',
        razorpay_signature: 'sig_sample_verified_303',
        status: 'paid',
      },
      itemsPrice,
      shippingPrice,
      taxPrice: 0,
      totalPrice,
      isPaid: true,
      paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      orderStatus: 'Processing',
    });
    console.log('[Seed] Sample initial order seeded for customer.');

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
