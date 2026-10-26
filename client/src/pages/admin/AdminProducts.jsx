import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, X, Check, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import productApi from '../../api/productApi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({ limit: 100 });
      setProducts(res.products || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setImagePreview('');
    reset({
      name: '',
      tagline: '',
      category: 'fruit-snack',
      description: '',
      weight: '100g',
      price: 199,
      originalPrice: 249,
      stock: 50,
      image: '',
      accentColor: '#1F6B3A',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setImagePreview(prod.image);
    reset({
      name: prod.name,
      tagline: prod.tagline,
      category: prod.category,
      description: prod.description,
      weight: prod.weight,
      price: prod.price,
      originalPrice: prod.originalPrice,
      stock: prod.stock,
      image: prod.image,
      accentColor: prod.accentColor || '#1F6B3A',
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await productApi.uploadImage(formData);
      setValue('image', res.url);
      setImagePreview(res.url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed. You can also paste an image URL directly.');
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        price: Number(values.price),
        originalPrice: Number(values.originalPrice),
        stock: Number(values.stock),
      };

      if (editingProduct) {
        await productApi.updateProduct(editingProduct._id, payload);
        toast.success('Product updated');
      } else {
        await productApi.createProduct(payload);
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      try {
        await productApi.deleteProduct(id);
        toast.success('Product deactivated');
        loadProducts();
      } catch (err) {
        toast.error('Failed to deactivate product');
      }
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
            Inventory & <span className="text-primary">Products</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Harvest Product</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream border-b border-cream-dark text-gray-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    Loading catalog inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-cream-light/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-cream border border-gray-100 shrink-0"
                          onError={(e) => {
                            if (p.imageFallback) e.currentTarget.src = p.imageFallback;
                          }}
                        />
                        <div>
                          <span className="font-heading font-bold text-sm text-gray-900 block">
                            {p.name}
                          </span>
                          <span className="text-gray-400 text-[11px]">{p.weight}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-cream text-woodBrown border border-cream-dark">
                        {typeof p.category === 'object' ? p.category?.name || p.category?.slug : p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">
                      ₹{p.price}
                      {p.originalPrice > p.price && (
                        <span className="text-gray-400 line-through text-[10px] ml-1.5">
                          ₹{p.originalPrice}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`font-bold ${
                          p.stock <= 10 ? 'text-amber-600' : 'text-gray-700'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-gray-500 hover:text-primary rounded-lg hover:bg-cream transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 text-gray-500 hover:text-brandRed rounded-lg hover:bg-cream transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="font-heading font-bold text-xl text-gray-900">
                  {editingProduct ? 'Edit Harvest Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      {...register('name', { required: true })}
                      type="text"
                      placeholder="e.g. Strawberry Crisps"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="fruit-snack">Fruit Snack</option>
                      <option value="powder">Culinary Powder</option>
                      <option value="instant">Instant Comfort Soup</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    {...register('tagline')}
                    type="text"
                    placeholder="Short punchy tagline"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Full Description *
                  </label>
                  <textarea
                    {...register('description', { required: true })}
                    rows={3}
                    placeholder="Describe orchard origin, gentle dehydration process, and flavors..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      {...register('price', { required: true })}
                      type="number"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Original Price (₹)
                    </label>
                    <input
                      {...register('originalPrice')}
                      type="number"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Stock Count *
                    </label>
                    <input
                      {...register('stock', { required: true })}
                      type="number"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Net Weight
                    </label>
                    <input
                      {...register('weight')}
                      type="text"
                      placeholder="e.g. 150g Jar"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Brand Accent Color Hex
                    </label>
                    <input
                      {...register('accentColor')}
                      type="text"
                      placeholder="#1F6B3A"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Image upload / URL */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Product Image (Upload File or Enter URL)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      {...register('image', { required: true })}
                      type="text"
                      placeholder="e.g. /assets/products/apple.webp or https://..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                    />
                    <label className="px-3 py-2 bg-cream hover:bg-cream-dark text-woodBrown rounded-xl border border-cream-dark cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {imagePreview && (
                    <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-cream-light p-1">
                      <img src={imagePreview} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
