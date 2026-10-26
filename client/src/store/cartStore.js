import { create } from 'zustand';
import cartApi from '../api/cartApi';
import toast from 'react-hot-toast';

const GUEST_CART_KEY = 'fyndry_guest_cart';

const loadGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
};

const BUY_NOW_KEY = 'fyndry_buy_now_item';

const loadBuyNow = () => {
  try {
    const raw = sessionStorage.getItem(BUY_NOW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const saveBuyNow = (item) => {
  try {
    if (item) {
      sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(item));
    } else {
      sessionStorage.removeItem(BUY_NOW_KEY);
    }
  } catch (e) {
    // ignore
  }
};

export const useCartStore = create((set, get) => ({
  items: loadGuestCart(),
  pricing: { subtotal: 0, shippingFee: 49, tax: 0, discount: 0, total: 0 },
  isCartOpen: false,
  buyNowItem: loadBuyNow(), // Persisted across login redirects
  loading: false,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  setBuyNowItem: (item) => {
    saveBuyNow(item);
    set({ buyNowItem: item });
  },
  clearBuyNowItem: () => {
    saveBuyNow(null);
    set({ buyNowItem: null });
  },

  /**
   * Recalculates client-side totals for guest cart
   */
  computeTotals: () => {
    const items = get().items;
    const subtotal = items.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
    const shippingFee = subtotal >= 499 || subtotal === 0 ? 0 : 49;
    const total = subtotal + shippingFee;

    set({
      pricing: { subtotal, shippingFee, tax: 0, discount: 0, total },
    });
  },

  /**
   * Fetch current cart from backend if authenticated; otherwise load from localStorage
   */
  fetchCart: async (isAuthenticated = false) => {
    if (!isAuthenticated) {
      const guestItems = loadGuestCart();
      set({ items: guestItems });
      get().computeTotals();
      return;
    }

    try {
      set({ loading: true });
      const res = await cartApi.getCart();
      const cartData = res.data;
      const items = cartData?.items || [];
      const pricing = cartData?.pricing || {
        subtotal: cartData?.subtotal || 0,
        shippingFee: cartData?.shippingFee || 0,
        tax: cartData?.tax || 0,
        total: cartData?.total || 0,
      };

      set({ items, pricing, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  /**
   * Merge guest items into server cart on user login
   */
  mergeGuestCart: async () => {
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) return;

    try {
      const payload = guestItems.map((item) => ({
        productId: item.product?._id || item.product?.id || item.productId,
        variantId: item.variantId || item.product?.variants?.[0]?._id,
        quantity: item.quantity || 1,
      }));

      const res = await cartApi.mergeCart(payload);
      const cartData = res.data;
      set({
        items: cartData?.items || [],
        pricing: cartData?.pricing || get().pricing,
      });
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (err) {
      console.warn('Could not merge guest cart with server cart:', err);
    }
  },

  /**
   * Add product variant to cart (optimistic update with rollback)
   */
  addToCart: async (product, variant = null, quantity = 1, isAuthenticated = false) => {
    const productId = product._id || product.id;
    const selectedVariant = variant || product.variants?.[0] || null;
    const variantId = selectedVariant?._id;
    const variantPrice = selectedVariant?.price || product.price || 0;
    const variantLabel = selectedVariant?.label || product.weight || '100g';
    const productImage =
      (Array.isArray(product.images) && product.images[0]?.url) ||
      product.image ||
      '/assets/products/Apple_Slices_Natural_Goodness_Label.webp';

    if (isAuthenticated) {
      const prevItems = [...get().items];
      const prevPricing = { ...get().pricing };

      // Optimistic update
      const optimisticItems = [...prevItems];
      const existingIdx = optimisticItems.findIndex(
        (it) =>
          (it.product?._id || it.product?.id || it.productId) === productId &&
          (!variantId || it.variantId === variantId)
      );

      if (existingIdx > -1) {
        optimisticItems[existingIdx].quantity += quantity;
      } else {
        optimisticItems.push({
          _id: `temp_${Date.now()}`,
          product: {
            _id: productId,
            name: product.name,
            slug: product.slug,
            image: productImage,
            price: variantPrice,
          },
          variantId,
          variantLabel,
          price: variantPrice,
          quantity,
          lineTotal: variantPrice * quantity,
        });
      }

      set({ items: optimisticItems });
      get().computeTotals();
      get().openCart();

      try {
        const res = await cartApi.addItem({ productId, variantId, quantity });
        const cartData = res.data;
        set({
          items: cartData?.items || [],
          pricing: cartData?.pricing || get().pricing,
        });
        toast.success(`Added ${product.name} (${variantLabel}) to cart!`);
        return;
      } catch (err) {
        // Rollback
        set({ items: prevItems, pricing: prevPricing });
        toast.error(err.response?.data?.message || err.message || 'Failed to add item to cart');
        return;
      }
    }

    // Guest cart in localStorage
    const currentItems = [...get().items];
    const existingIndex = currentItems.findIndex(
      (item) =>
        (item.product?._id || item.product?.id) === productId &&
        (!variantId || item.variantId === variantId)
    );

    if (existingIndex > -1) {
      currentItems[existingIndex].quantity += quantity;
      currentItems[existingIndex].lineTotal =
        currentItems[existingIndex].quantity * currentItems[existingIndex].price;
    } else {
      currentItems.push({
        _id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        product: {
          _id: productId,
          name: product.name,
          slug: product.slug,
          image: productImage,
          images: product.images || [{ url: productImage }],
          price: variantPrice,
        },
        variantId,
        variantLabel,
        price: variantPrice,
        quantity,
        lineTotal: variantPrice * quantity,
      });
    }

    saveGuestCart(currentItems);
    set({ items: currentItems });
    get().computeTotals();
    toast.success(`Added ${product.name} (${variantLabel}) to cart!`);
    get().openCart();
  },

  /**
   * Update item quantity (optimistic update with rollback)
   */
  updateQuantity: async (itemId, quantity, isAuthenticated = false) => {
    if (quantity <= 0) {
      return get().removeItem(itemId, isAuthenticated);
    }

    if (isAuthenticated) {
      const prevItems = [...get().items];
      const prevPricing = { ...get().pricing };

      // Optimistic update
      const updated = prevItems.map((item) => {
        const pId = item.product?._id || item.product?.id || item.productId;
        if (item._id === itemId || pId === itemId) {
          return {
            ...item,
            quantity,
            lineTotal: quantity * (item.price || item.product?.price || 0),
          };
        }
        return item;
      });

      set({ items: updated });
      get().computeTotals();

      try {
        const res = await cartApi.updateItemQuantity(itemId, quantity);
        const cartData = res.data;
        set({
          items: cartData?.items || [],
          pricing: cartData?.pricing || get().pricing,
        });
        return;
      } catch (err) {
        // Rollback on failure
        set({ items: prevItems, pricing: prevPricing });
        toast.error(err.response?.data?.message || 'Failed to update quantity');
        return;
      }
    }

    const currentItems = get().items.map((item) => {
      const pId = item.product?._id || item.product?.id || item.productId;
      if (item._id === itemId || pId === itemId) {
        return {
          ...item,
          quantity,
          lineTotal: quantity * (item.price || item.product?.price || 0),
        };
      }
      return item;
    });

    saveGuestCart(currentItems);
    set({ items: currentItems });
    get().computeTotals();
  },

  /**
   * Remove item from cart (optimistic update with rollback)
   */
  removeItem: async (itemId, isAuthenticated = false) => {
    if (isAuthenticated) {
      const prevItems = [...get().items];
      const prevPricing = { ...get().pricing };

      // Optimistic removal
      const filtered = prevItems.filter((item) => {
        const pId = item.product?._id || item.product?.id || item.productId;
        return item._id !== itemId && pId !== itemId;
      });

      set({ items: filtered });
      get().computeTotals();

      try {
        const res = await cartApi.removeItem(itemId);
        const cartData = res.data;
        set({
          items: cartData?.items || [],
          pricing: cartData?.pricing || get().pricing,
        });
        toast.success('Item removed from cart');
        return;
      } catch (err) {
        // Rollback
        set({ items: prevItems, pricing: prevPricing });
        toast.error(err.response?.data?.message || 'Failed to remove item');
        return;
      }
    }

    const currentItems = get().items.filter((item) => {
      const pId = item.product?._id || item.product?.id || item.productId;
      return item._id !== itemId && pId !== itemId;
    });
    saveGuestCart(currentItems);
    set({ items: currentItems });
    get().computeTotals();
    toast.success('Item removed from cart');
  },

  /**
   * Clear all cart items
   */
  clearCart: async (isAuthenticated = false) => {
    if (isAuthenticated) {
      try {
        await cartApi.clearCart();
      } catch (err) {
        // ignore
      }
    }

    localStorage.removeItem(GUEST_CART_KEY);
    set({
      items: [],
      pricing: { subtotal: 0, shippingFee: 49, tax: 0, discount: 0, total: 0 },
    });
  },

  // Alias for backward compatibility
  syncGuestCartOnLogin: async () => {
    return get().mergeGuestCart();
  },

  // Subtotal helper for CartDrawer, Checkout, and other components
  getSubtotal: () => {
    const pricing = get().pricing;
    if (pricing && pricing.subtotal > 0) return pricing.subtotal;
    const items = get().items || [];
    return items.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  },

  // Total helper including shipping
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const shippingFee = subtotal >= 499 || subtotal === 0 ? 0 : 49;
    return subtotal + shippingFee;
  },

  // Computed helper for total items count
  getTotalCount: () => {
    return (get().items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
  },
  getTotalItems: () => {
    return (get().items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
  },
}));

export default useCartStore;
