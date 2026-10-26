import { products as fallbackProducts, categories as fallbackCategories } from '../data/products';
import productApi from '../api/productApi';

/**
 * Product Service Layer
 * Seamlessly interfaces with the MERN backend API while retaining instant
 * local fallback for optimal performance and resilience.
 */
export const productService = {
  /**
   * Fetch all products sorted by their default display order
   */
  async getAllProducts() {
    try {
      const res = await productApi.getProducts();
      if (res?.products && res.products.length > 0) {
        return res.products.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      // fallback to local data
    }
    return Promise.resolve([...fallbackProducts].sort((a, b) => a.order - b.order));
  },

  /**
   * Fetch products by category slug ('all', 'fruit-snack', 'powder', 'instant')
   */
  async getProductsByCategory(category = 'all') {
    if (!category || category === 'all') {
      return this.getAllProducts();
    }
    try {
      const res = await productApi.getProducts({ category });
      if (res?.products && res.products.length > 0) {
        return res.products.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (e) {
      // fallback
    }
    const filtered = fallbackProducts.filter((item) => {
      const cat = typeof item.category === 'object' ? item.category?.slug || item.category?.name : item.category;
      return cat && cat.toLowerCase() === String(category).toLowerCase();
    });
    return Promise.resolve(filtered.sort((a, b) => a.order - b.order));
  },

  /**
   * Fetch a single product by its slug
   */
  async getProductBySlug(slug) {
    try {
      const prod = await productApi.getProductBySlug(slug);
      if (prod) return prod;
    } catch (e) {
      // fallback
    }
    const item = fallbackProducts.find((p) => p.slug === slug);
    return Promise.resolve(item || null);
  },

  /**
   * Fetch all available product categories
   */
  async getCategories() {
    try {
      const cats = await productApi.getCategories();
      if (cats && cats.length > 0) return cats;
    } catch (e) {
      // fallback
    }
    return Promise.resolve(fallbackCategories);
  },

  /**
   * Get featured products (e.g., for Hero collage or top highlights)
   */
  async getFeaturedProducts(limit = 3) {
    const all = await this.getAllProducts();
    return all.slice(0, limit);
  },
};

export default productService;
