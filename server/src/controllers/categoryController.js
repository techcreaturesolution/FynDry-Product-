import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/categories
 * @desc    Get all active categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });

  // Optional: attach product counts per category
  const productCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countsMap = productCounts.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat.toJSON(),
    productCount: countsMap[cat._id.toString()] || 0,
  }));

  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
  res.status(200).json({
    success: true,
    count: categoriesWithCounts.length,
    data: categoriesWithCounts,
  });
});

/**
 * @route   GET /api/categories/:slug
 * @desc    Get single category by slug
 * @access  Public
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug, isActive: true });

  if (!category) {
    throw new ApiError(404, `Category with slug '${slug}' not found`);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories for admin (including inactive)
 * @access  Private (Admin)
 */
export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

/**
 * @route   POST /api/admin/categories
 * @desc    Create a new category
 * @access  Private (Admin)
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, image, isActive, order } = req.body;

  const existing = await Category.findOne({
    $or: [{ name: name.trim() }, ...(slug ? [{ slug: slug.trim().toLowerCase() }] : [])],
  });

  if (existing) {
    throw new ApiError(409, `A category with this name or slug already exists.`);
  }

  let imageUrl = image || '';
  if (req.file) {
    imageUrl = req.file.path.startsWith('http')
      ? req.file.path
      : `/uploads/${req.file.filename}`;
  }

  const category = await Category.create({
    name,
    slug,
    description,
    image: imageUrl,
    isActive: isActive !== undefined ? isActive : true,
    order: order !== undefined ? Number(order) : 0,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

/**
 * @route   PATCH /api/admin/categories/:id
 * @desc    Update category by ID
 * @access  Private (Admin)
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (req.file) {
    updates.image = req.file.path.startsWith('http')
      ? req.file.path
      : `/uploads/${req.file.filename}`;
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  Object.assign(category, updates);
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category by ID
 * @access  Private (Admin)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const linkedProductsCount = await Product.countDocuments({ category: id });
  if (linkedProductsCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category: ${linkedProductsCount} product(s) are assigned to this category. Reassign them first.`
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    data: null,
  });
});

export default {
  getCategories,
  getCategoryBySlug,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
};
