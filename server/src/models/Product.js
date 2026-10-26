import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Variant label is required (e.g. 100g)'],
      trim: true,
    },
    weightInGrams: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Variant price is required'],
      min: [0, 'Price must be positive'],
    },
    mrp: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 50,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    highlights: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true,
    },
    images: {
      type: [imageSchema],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one image is required for a product',
      },
    },
    accentColor: {
      type: String,
      default: '#1F6B3A',
      trim: true,
    },
    variants: {
      type: [variantSchema],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one variant is required (e.g. 100g)',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: String,
      default: '',
      trim: true,
    },
    shelfLife: {
      type: String,
      default: '12 Months',
      trim: true,
    },
    storageInstructions: {
      type: String,
      default: 'Store in a cool, dry place. Seal tightly after opening.',
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    ratingAvg: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 12,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text search index on name, tagline, tags
productSchema.index({ name: 'text', tagline: 'text', tags: 'text' });
productSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, 'variants.price': 1 });

// Auto-generate slug from name if not provided
productSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Virtual: minPrice (lowest price among variants)
productSchema.virtual('minPrice').get(function () {
  if (!this.variants || this.variants.length === 0) return 0;
  return Math.min(...this.variants.map((v) => v.price));
});

// Virtual: inStock (true if any variant has stock > 0)
productSchema.virtual('inStock').get(function () {
  if (!this.variants || this.variants.length === 0) return false;
  return this.variants.some((v) => v.stock > 0);
});

// Backwards compatibility virtuals for existing frontend components:
productSchema.virtual('price').get(function () {
  return this.variants?.[0]?.price || this.minPrice || 0;
});

productSchema.virtual('originalPrice').get(function () {
  return this.variants?.[0]?.mrp || 0;
});

productSchema.virtual('weight').get(function () {
  return this.variants?.[0]?.label || '100g';
});

productSchema.virtual('stock').get(function () {
  if (!this.variants) return 0;
  return this.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
});

productSchema.virtual('image').get(function () {
  return this.images?.[0]?.url || '';
});

const Product = mongoose.model('Product', productSchema);
export default Product;
