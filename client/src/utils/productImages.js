import { products } from '../data/products';

// Create map of bundled assets by product slug
const localAssetMap = products.reduce((acc, p) => {
  acc[p.slug] = {
    image: p.image,
    imageFallback: p.imageFallback,
    detailImage: p.detailImage,
    detailImageFallback: p.detailImageFallback,
  };
  return acc;
}, {});

/**
 * Resolves reliable image assets for a product.
 * Returns bundled, optimized WebP/PNG assets for the default catalog,
 * or the uploaded URL for custom admin products.
 */
export function getProductAssets(product) {
  if (!product) {
    return {
      image: '',
      imageFallback: '',
      detailImage: '',
      detailImageFallback: '',
    };
  }

  // 1. Check if it's one of our core catalog items by slug
  const matched = product.slug ? localAssetMap[product.slug] : null;
  if (matched && matched.image) {
    return {
      image: matched.image,
      imageFallback: matched.imageFallback,
      detailImage: matched.detailImage || matched.image,
      detailImageFallback: matched.detailImageFallback || matched.imageFallback,
    };
  }

  // 2. Custom or uploaded product images
  const primary = product.image || '';
  const fallback = product.imageFallback || primary;
  const detail = product.detailImage || primary;
  const detailFallback = product.detailImageFallback || fallback;

  return {
    image: primary,
    imageFallback: fallback,
    detailImage: detail,
    detailImageFallback: detailFallback,
  };
}

export default getProductAssets;
