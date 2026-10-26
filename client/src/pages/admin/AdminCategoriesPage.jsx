import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/ui/Button';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [order, setOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.categories || [];
      setCategories(list);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setOrder(0);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setImageUrl(cat.image || '');
    setImageFile(null);
    setImagePreview(cat.image || '');
    setOrder(cat.order || 0);
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());
        formData.append('order', Number(order) || 0);
        formData.append('image', imageFile);

        if (editingCategory) {
          await adminApi.updateCategory(editingCategory._id, formData);
          toast.success('Category updated successfully');
        } else {
          await adminApi.createCategory(formData);
          toast.success('Category created successfully');
        }
      } else {
        const payload = {
          name: name.trim(),
          description: description.trim(),
          image: imageUrl.trim() || undefined,
          order: Number(order) || 0,
        };

        if (editingCategory) {
          await adminApi.updateCategory(editingCategory._id, payload);
          toast.success('Category updated successfully');
        } else {
          await adminApi.createCategory(payload);
          toast.success('Category created successfully');
        }
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteCategory(deleteId);
      toast.success('Category removed');
      setCategories((prev) => prev.filter((c) => c._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Thumbnail',
      render: (_, cat) => {
        const img = cat.image || '/assets/categories/cat_fruits.png';
        return (
          <div className="w-12 h-12 rounded-2xl bg-cream/50 p-1 flex items-center justify-center border border-gray-100 overflow-hidden">
            <img src={img} alt="" className="w-full h-full object-contain" />
          </div>
        );
      },
    },
    {
      key: 'name',
      label: 'Category Name & Slug',
      render: (_, cat) => (
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{cat.name}</h4>
          <span className="text-[11px] text-gray-400 font-mono">/{cat.slug}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (desc) => (
        <p className="text-gray-600 max-w-xs text-xs line-clamp-2">
          {desc || 'No description added'}
        </p>
      ),
    },
    {
      key: 'order',
      label: 'Sort Order',
      render: (ord) => (
        <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg text-xs">
          #{ord || 0}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (active) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Active
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, cat) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(cat)}
            className="p-2 rounded-xl text-gray-500 hover:text-primary hover:bg-primary-50 transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteId(cat._id)}
            className="p-2 rounded-xl text-gray-500 hover:text-brandRed hover:bg-red-50 transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Organize catalog products into intuitive fruit and snack collections.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          icon={Plus}
          iconPosition="left"
        >
          Add New Category
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories defined yet."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-body animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-heading font-black text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category Name <span className="text-brandRed">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Crisp Fruits"
                  className="w-full bg-gray-50 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold border border-gray-200 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of this category grouping..."
                  className="w-full bg-gray-50 rounded-2xl p-3 text-xs border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Category Image Upload / Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category Icon / Image
                </label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="w-16 h-16 rounded-2xl bg-cream/40 p-1 border border-primary/30 relative shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setImageUrl('');
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brandRed text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-primary transition-colors shrink-0"
                    >
                      <UploadCloud className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-0.5">Upload</span>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex-1">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Or enter image URL..."
                      className="w-full bg-gray-50 rounded-xl px-3 py-1.5 text-xs border border-gray-200 focus:outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Upload a photo or paste a URL</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Display Order Index
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full bg-gray-50 rounded-2xl px-4 py-2 text-xs border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm" loading={submitting}>
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products assigned to it may become unassigned."
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
