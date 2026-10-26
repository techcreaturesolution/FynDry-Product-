import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminApi from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import ProductForm from '../../components/admin/ProductForm';

export default function AdminProductNewPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
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
    }
    loadCategories();
  }, []);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const hasFiles = payload.images.some((img) => img.file);

      if (hasFiles) {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          if (key === 'images') {
            const existingImages = payload.images.filter((img) => !img.file);
            formData.append('images', JSON.stringify(existingImages));
            payload.images.forEach((img) => {
              if (img.file) {
                formData.append('images', img.file);
              }
            });
          } else if (Array.isArray(payload[key]) || typeof payload[key] === 'object') {
            formData.append(key, JSON.stringify(payload[key]));
          } else {
            formData.append(key, payload[key]);
          }
        });
        await adminApi.createProduct(formData);
      } else {
        await adminApi.createProduct(payload);
      }

      toast.success('Product created and saved successfully!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center font-body">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-bold text-gray-500">Loading form options...</p>
      </div>
    );
  }

  return (
    <ProductForm
      categories={categories}
      onSubmit={handleSubmit}
      submitting={submitting}
      isEdit={false}
    />
  );
}
