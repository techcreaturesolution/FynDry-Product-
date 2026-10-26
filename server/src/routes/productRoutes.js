import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
} from '../controllers/productController.js';
import { getCategories } from '../controllers/categoryController.js';

const router = express.Router();

// Public endpoints
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories); // Compatibility for frontend
router.get('/slug/:slug', getProductBySlug); // Compatibility alias
router.get('/id/:id', getProductById);
router.get('/:slug', getProductBySlug);

export default router;
