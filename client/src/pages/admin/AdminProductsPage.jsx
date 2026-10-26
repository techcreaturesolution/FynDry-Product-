import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  Filter,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/ui/Button';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Delete Dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts({ limit: 200 }),
        adminApi.getCategories(),
      ]);

      const prodList = Array.isArray(prodRes.data)
        ? prodRes.data
        : prodRes.data?.products || [];
      const catList = Array.isArray(catRes.data)
        ? catRes.data
        : catRes.data?.categories || [];

      setProducts(prodList);
      setCategories(catList);
    } catch (err) {
      toast.error('Failed to load products list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id) => {
    try {
      await adminApi.toggleProduct(id);
      toast.success('Product status updated');
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch (err) {
      toast.error('Failed to toggle product status');
    }
  };

  const handleBulkStatus = async (isActive) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await adminApi.bulkUpdateProducts(selectedIds, isActive);
      toast.success(
        `Updated ${selectedIds.length} products to ${isActive ? 'Active' : 'Inactive'}`
      );
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p._id) ? { ...p, isActive } : p))
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteProduct(deleteId, false);
      toast.success('Product deleted / archived successfully');
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  // Filter products by search, category, stock
  const filteredProducts = products.filter((p) => {
    // Search filter
    if (
      search &&
      !p.name?.toLowerCase().includes(search.toLowerCase()) &&
      !p.tagline?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const catId = typeof p.category === 'object' ? p.category?._id : p.category;
      if (catId !== selectedCategory) return false;
    }

    // Stock filter
    const variants = p.variants || [];
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    if (stockFilter === 'in_stock' && totalStock <= 0) return false;
    if (stockFilter === 'out_of_stock' && totalStock > 0) return false;

    return true;
  });

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (_, prod) => {
        const img =
          (Array.isArray(prod.images) && prod.images[0]?.url) ||
          prod.image ||
          '/assets/products/Apple_Slices_Natural_Goodness_Label.webp';

        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cream/50 p-1.5 shrink-0 flex items-center justify-center border border-gray-100">
              <img src={img} alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{prod.name}</h4>
              <p className="text-[11px] text-gray-400 line-clamp-1">{prod.tagline}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      label: 'Category',
      render: (_, prod) => {
        const catName =
          typeof prod.category === 'object' ? prod.category?.name : prod.category;
        return (
          <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-xl text-[11px]">
            {catName || 'Unassigned'}
          </span>
        );
      },
    },
    {
      key: 'priceRange',
      label: 'Price Range',
      render: (_, prod) => {
        const variants = prod.variants || [];
        if (variants.length === 0) return <span className="text-gray-400">N/A</span>;
        const prices = variants.map((v) => v.price || 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return (
          <span className="font-heading font-black text-primary text-xs">
            {minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`}
          </span>
        );
      },
    },
    {
      key: 'stock',
      label: 'Total Stock',
      render: (_, prod) => {
        const variants = prod.variants || [];
        const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

        return (
          <div className="space-y-1">
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                totalStock <= 5
                  ? 'bg-red-50 text-brandRed border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {totalStock} units
            </span>
            <div className="text-[10px] text-gray-400">
              {variants.length} variant(s)
            </div>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive, prod) => (
        <button
          type="button"
          onClick={() => handleToggle(prod._id)}
          className="inline-flex items-center gap-1.5 font-bold cursor-pointer transition-transform active:scale-95"
          title="Click to toggle status"
        >
          {isActive !== false ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Active
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Inactive
            </span>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, prod) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/admin/products/${prod._id}/edit`}
            className="p-2 rounded-xl text-gray-500 hover:text-primary hover:bg-primary-50 transition-colors"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteId(prod._id)}
            className="p-2 rounded-xl text-gray-500 hover:text-brandRed hover:bg-red-50 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage multi-size variants, stock thresholds, pricing, and active publication status.
          </p>
        </div>

        <Button
          href="/admin/products/new"
          variant="primary"
          size="sm"
          icon={Plus}
          iconPosition="left"
        >
          Add New Product
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-soft flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or tagline..."
            className="w-full bg-gray-50 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-50 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold border border-gray-200 focus:outline-none focus:border-primary cursor-pointer text-gray-700"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Stock Status Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="bg-gray-50 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold border border-gray-200 focus:outline-none focus:border-primary cursor-pointer text-gray-700"
        >
          <option value="all">All Stock Status</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Reusable DataTable with Selection and Bulk Actions */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        loading={loading}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(p) => p._id}
        bulkActions={[
          {
            label: 'Activate Selected',
            onClick: () => handleBulkStatus(true),
          },
          {
            label: 'Deactivate Selected',
            variant: 'danger',
            onClick: () => handleBulkStatus(false),
          },
        ]}
        emptyMessage="No products match your current search and filter criteria."
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Product"
        message="Are you sure you want to remove this product from the store catalog? Deactivating or archiving is recommended instead of hard deletion."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
