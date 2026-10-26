import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminApi from '../../api/adminApi';
import productApi from '../../api/productApi';
import Spinner from '../../components/ui/Spinner';
import ProductForm from '../../components/admin/ProductForm';

export default function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catsRes, adminProdsRes] = await Promise.all([
          adminApi.getCategories(),
          adminApi.getProducts({ limit: 300 }),
        ]);

        const cats = Array.isArray(catsRes.data)
          ? catsRes.data
          : catsRes.data?.categories || [];
        setCategories(cats);

        const prodList = Array.isArray(adminProdsRes.data)
          ? adminProdsRes.data
          : adminProdsRes.data?.products || [];
        let target = prodList.find((p) => p._id === id || p.slug === id);

        if (!target) {
          // Fallback to fetch by slug/id
          try {
            const singleRes = await productApi.getProductBySlug(id);
            target = singleRes.data?.data || singleRes.data?.product || singleRes.data;
          } catch (e) {
            console.warn('Could not fetch single product by slug:', e);
          }
        }

        if (target) {
          setProduct(target);
        } else {
          toast.error('Product not found');
        }
      } catch (err) {
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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
        await adminApi.updateProduct(product._id || id, formData);
      } else {
        await adminApi.updateProduct(product._id || id, payload);
      }

      toast.success('Product updated and saved successfully!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center font-body">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-bold text-gray-500">Loading product data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center font-body">
        <p className="text-sm font-bold text-gray-700">Product not found.</p>
        <button
          onClick={() => navigate('/admin/products')}
          className="mt-3 text-xs font-bold text-primary underline"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <ProductForm
      initialData={product}
      categories={categories}
      onSubmit={handleSubmit}
      submitting={submitting}
      isEdit={true}
    />
  );
}
