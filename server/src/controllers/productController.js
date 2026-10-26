import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { deleteCloudinaryImage } from '../config/cloudinary.js';

/**
 * Helper to parse multipart stringified JSON or CSV fields
 */
const parseFormField = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Split by comma if not valid JSON
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return fallback;
};

// ==========================================
// PUBLIC CONTROLLERS
// ==========================================

/**
 * @route   GET /api/products
 * @desc    Get all active products with pagination, search, category & price filters
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    minPrice,
    maxPrice,
    sort = 'newest',
    inStock,
  } = req.query;

  const query = { isActive: true };

  // Category filter: by Category slug or Category ObjectId
  if (category && category !== 'all') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const matchedCategory = await Category.findOne({ slug: category.toLowerCase().trim() });
      if (matchedCategory) {
        query.category = matchedCategory._id;
      } else {
        // Unknown category slug, return empty
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: Number(page),
          pages: 0,
          data: [],
        });
      }
    }
  }

  // Full-text / Regex search filter
  if (search && search.trim()) {
    const term = search.trim();
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { tagline: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { tags: { $in: [new RegExp(term, 'i')] } },
    ];
  }

  // Price range filters on variants
  if (minPrice || maxPrice) {
    query['variants.price'] = {};
    if (minPrice !== undefined && minPrice !== '') {
      query['variants.price'].$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      query['variants.price'].$lte = Number(maxPrice);
    }
  }

  // inStock filter
  if (inStock === 'true' || inStock === true) {
    query['variants.stock'] = { $gt: 0 };
  } else if (inStock === 'false' || inStock === false) {
    query['variants.stock'] = { $lte: 0 };
  }

  // Sort options: price_asc | price_desc | newest | featured
  let sortOption = { order: 1, createdAt: -1 };
  if (sort === 'price_asc' || sort === 'price-low') {
    sortOption = { 'variants.price': 1 };
  } else if (sort === 'price_desc' || sort === 'price-high') {
    sortOption = { 'variants.price': -1 };
  } else if (sort === 'featured') {
    sortOption = { isFeatured: -1, order: 1, createdAt: -1 };
  } else if (sort === 'newest') {
    sortOption = { createdAt: -1 };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug image')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: products,
  });
});

/**
 * @route   GET /api/products/featured
 * @desc    Get featured active products
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug image')
    .sort({ order: 1, createdAt: -1 })
    .limit(8);

  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

/**
 * @route   GET /api/products/:slug
 * @desc    Get product details by unique slug
 * @access  Public
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true }).populate(
    'category',
    'name slug description image'
  );

  if (!product) {
    throw new ApiError(404, `Product '${slug}' not found`);
  }

  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.status(200).json({
    success: true,
    data: product,
  });
});

/**
 * @route   GET /api/products/id/:id
 * @desc    Get product details by ID
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate('category', 'name slug description');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// ==========================================
// ADMIN CONTROLLERS (protect + authorize("admin"))
// ==========================================

/**
 * @route   GET /api/admin/products
 * @desc    Get all products for admin (including inactive) with search & pagination
 * @access  Private (Admin)
 */
export const getAdminProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category, status } = req.query;

  const query = {};

  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
  }

  if (search && search.trim()) {
    const term = search.trim();
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { slug: { $regex: term, $options: 'i' } },
      { tagline: { $regex: term, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: products,
  });
});

/**
 * @route   POST /api/admin/products
 * @desc    Create product with multipart images (up to 6)
 * @access  Private (Admin)
 */
export const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  // Parse variants if passed as JSON string
  if (typeof body.variants === 'string') {
    try {
      body.variants = JSON.parse(body.variants);
    } catch {
      throw new ApiError(400, 'Variants must be a valid JSON array');
    }
  }

  // Parse highlights and tags
  body.highlights = parseFormField(body.highlights, []);
  body.tags = parseFormField(body.tags, []);

  // Process uploaded images (up to 6 via multer)
  const images = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    req.files.forEach((file) => {
      images.push({
        url: file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`,
        publicId: file.filename || file.path,
      });
    });
  }

  // If images array was also passed in JSON body
  if (body.images) {
    const passedImages = typeof body.images === 'string' ? JSON.parse(body.images) : body.images;
    if (Array.isArray(passedImages)) {
      images.push(...passedImages);
    }
  }

  if (images.length === 0) {
    throw new ApiError(400, 'At least one image is required for the product');
  }
  body.images = images;

  // Resolve Category ID if slug was passed
  if (body.category && !mongoose.Types.ObjectId.isValid(body.category)) {
    const categoryDoc = await Category.findOne({ slug: body.category.toLowerCase().trim() });
    if (!categoryDoc) {
      throw new ApiError(400, `Category with slug '${body.category}' does not exist`);
    }
    body.category = categoryDoc._id;
  }

  body.vendor = req.user?._id;

  const product = await Product.create(body);
  const populated = await Product.findById(product._id).populate('category', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: populated,
  });
});

/**
 * @route   PATCH /api/admin/products/:id
 * @desc    Update product details, add/remove images, update variants
 * @access  Private (Admin)
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const updates = { ...req.body };

  // Parse JSON fields if passed in multipart form-data
  if (typeof updates.variants === 'string') {
    updates.variants = JSON.parse(updates.variants);
  }
  if (updates.highlights) {
    updates.highlights = parseFormField(updates.highlights, product.highlights);
  }
  if (updates.tags) {
    updates.tags = parseFormField(updates.tags, product.tags);
  }

  // Resolve category if updated
  if (updates.category && !mongoose.Types.ObjectId.isValid(updates.category)) {
    const categoryDoc = await Category.findOne({ slug: updates.category.toLowerCase().trim() });
    if (!categoryDoc) {
      throw new ApiError(400, `Category '${updates.category}' not found`);
    }
    updates.category = categoryDoc._id;
  }

  // Handle image removal if removeImagePublicIds specified
  if (updates.removeImagePublicIds) {
    const removeIds = parseFormField(updates.removeImagePublicIds, []);
    for (const publicId of removeIds) {
      await deleteCloudinaryImage(publicId);
      product.images = product.images.filter((img) => img.publicId !== publicId && img.url !== publicId);
    }
    delete updates.removeImagePublicIds;
  }

  // Handle new uploaded images
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`,
      publicId: file.filename || file.path,
    }));
    product.images.push(...newImages);
  }

  // Enforce max 6 images
  if (product.images.length > 6) {
    product.images = product.images.slice(0, 6);
  }

  // Apply updates to product
  Object.keys(updates).forEach((key) => {
    if (key !== 'images') {
      product[key] = updates[key];
    }
  });

  await product.save();
  const populated = await Product.findById(product._id).populate('category', 'name slug');

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: populated,
  });
});

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Soft delete (isActive=false) or Hard delete (?hard=true)
 * @access  Private (Admin)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isHardDelete = req.query.hard === 'true';

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (isHardDelete) {
    // Delete all linked images
    for (const image of product.images) {
      if (image.publicId) {
        await deleteCloudinaryImage(image.publicId);
      }
    }
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Product permanently deleted',
      data: null,
    });
  }

  // Soft delete by default
  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product deactivated (soft deleted) successfully',
    data: {
      _id: product._id,
      name: product.name,
      isActive: product.isActive,
    },
  });
});

/**
 * @route   PATCH /api/admin/products/:id/stock
 * @desc    Update a specific variant's stock
 * @access  Private (Admin)
 */
export const updateProductStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { variantId, sku, stock } = req.body;

  if (stock === undefined || Number(stock) < 0) {
    throw new ApiError(400, 'Valid non-negative stock count is required');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  let variantFound = false;

  // Search by variantId or sku or fallback to first variant
  for (const variant of product.variants) {
    if (
      (variantId && variant._id.toString() === variantId) ||
      (sku && variant.sku === sku)
    ) {
      variant.stock = Number(stock);
      variantFound = true;
      break;
    }
  }

  if (!variantFound && product.variants.length > 0 && !variantId && !sku) {
    // Update primary variant if no specific variant identifier given
    product.variants[0].stock = Number(stock);
    variantFound = true;
  }

  if (!variantFound) {
    throw new ApiError(404, 'Matching variant not found on this product');
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Variant stock updated successfully',
    data: {
      _id: product._id,
      name: product.name,
      variants: product.variants,
      inStock: product.inStock,
    },
  });
});

/**
 * @route   PATCH /api/admin/products/:id/toggle
 * @desc    Toggle product active/inactive state
 * @access  Private (Admin)
 */
export const toggleProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  product.isActive = !product.isActive;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      _id: product._id,
      name: product.name,
      isActive: product.isActive,
    },
  });
});

/**
 * @route   PATCH /api/admin/products/bulk
 * @desc    Bulk activate/deactivate products
 * @access  Private (Admin)
 */
export const bulkUpdateProductStatus = asyncHandler(async (req, res) => {
  const { productIds, isActive } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, 'productIds must be a non-empty array of IDs');
  }

  if (typeof isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }

  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: { isActive } }
  );

  res.status(200).json({
    success: true,
    message: `Successfully updated ${result.modifiedCount} products to ${isActive ? 'active' : 'inactive'}`,
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      isActive,
    },
  });
});

export default {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  toggleProductStatus,
  bulkUpdateProductStatus,
};
