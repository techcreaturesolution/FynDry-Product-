import express from 'express';
import {
  getDashboardStats,
  getCustomersAdmin,
  getCustomerByIdAdmin,
  getSettingsAdmin,
  updateSettingsAdmin,
} from '../controllers/adminController.js';
import {
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
} from '../controllers/orderController.js';
import {
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  toggleProductStatus,
  bulkUpdateProductStatus,
} from '../controllers/productController.js';

import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/categoryValidator.js';
import { updateStockSchema } from '../validators/productValidator.js';
import { updateOrderStatusSchema } from '../validators/orderValidator.js';
import { uploadProductImages, uploadSingleImage } from '../config/cloudinary.js';

const router = express.Router();

// Enforce authentication & admin authorization for all /api/admin/* endpoints
router.use(protect, authorize('admin'));

// ------------------------------------------
// Admin Analytics Dashboard & Customers
// ------------------------------------------
router.get('/dashboard', getDashboardStats);
router.get('/stats', getDashboardStats); // Compatibility alias
router.get('/customers', getCustomersAdmin);
router.get('/customers/:id', getCustomerByIdAdmin);

// ------------------------------------------
// Admin Settings
// ------------------------------------------
router.get('/settings', getSettingsAdmin);
router.patch('/settings', updateSettingsAdmin);

// ------------------------------------------
// Admin Orders Management
// ------------------------------------------
router.get('/orders', getAllOrdersAdmin);
router.get('/orders/:id', getOrderByIdAdmin);
router.patch(
  '/orders/:id/status',
  validate(updateOrderStatusSchema),
  updateOrderStatusAdmin
);

// ------------------------------------------
// Admin Categories Management
// ------------------------------------------
router.get('/categories', getAllCategoriesAdmin);
router.post(
  '/categories',
  uploadSingleImage,
  validate(createCategorySchema),
  createCategory
);
router.patch(
  '/categories/:id',
  uploadSingleImage,
  validate(updateCategorySchema),
  updateCategory
);
router.delete('/categories/:id', deleteCategory);

// ------------------------------------------
// Admin Products Management
// ------------------------------------------
router.get('/products', getAdminProducts);
router.patch('/products/bulk', bulkUpdateProductStatus);
router.post('/products', uploadProductImages, createProduct);
router.patch('/products/:id', uploadProductImages, updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', validate(updateStockSchema), updateProductStock);
router.patch('/products/:id/toggle', toggleProductStatus);

export default router;
