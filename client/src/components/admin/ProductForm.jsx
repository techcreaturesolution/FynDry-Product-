import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Eye,
  AlertCircle,
  X,
  Palette,
  Tag,
} from 'lucide-react';
import ImageUploader from './ImageUploader';
import ConfirmDialog from './ConfirmDialog';
import Button from '../ui/Button';

const COLOR_PRESETS = [
  '#1F6B3A', // FynDry Leaf Green
  '#A3260F', // FynDry Brand Red
  '#8B5A2B', // FynDry Wood Brown
  '#D97706', // Amber / Mango
  '#DC2626', // Strawberry Red
  '#059669', // Emerald
  '#2563EB', // Blueberry
  '#7C3AED', // Jamun Purple
];

export default function ProductForm({
  initialData = null,
  categories = [],
  onSubmit,
  isEdit = false,
  submitting = false,
}) {
  const navigate = useNavigate();

  // Basic Information
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugManual, setIsSlugManual] = useState(Boolean(initialData?.slug));
  const [categoryId, setCategoryId] = useState(
    (typeof initialData?.category === 'object'
      ? initialData?.category?._id
      : initialData?.category) || ''
  );
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ''
  );
  const [description, setDescription] = useState(initialData?.description || '');

  // Dynamic Highlights List
  const [highlights, setHighlights] = useState(
    initialData?.highlights?.length > 0
      ? initialData.highlights
      : [
          'Naturally preserved with low-temperature warm air',
          'Locks in vital vitamins and natural fruit sweetness',
          'Zero added preservatives, sulphur, or refined sugar',
        ]
  );
  const [newHighlight, setNewHighlight] = useState('');

  // Storage & Ingredients
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients || '100% Farm-fresh produce'
  );
  const [shelfLife, setShelfLife] = useState(initialData?.shelfLife || '12 Months');
  const [storageInstructions, setStorageInstructions] = useState(
    initialData?.storageInstructions ||
      'Store in a cool, dry place. Reseal zip-lock tightly after opening.'
  );

  // Appearance & Categorization
  const [accentColor, setAccentColor] = useState(
    initialData?.accentColor || '#1F6B3A'
  );
  const [tags, setTags] = useState(
    Array.isArray(initialData?.tags) ? initialData.tags : ['organic', 'gluten-free', 'vegan']
  );
  const [tagInput, setTagInput] = useState('');

  // Publishing & Visibility
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [isActive, setIsActive] = useState(
    initialData?.isActive !== undefined ? Boolean(initialData.isActive) : true
  );

  // Images Manager
  const [images, setImages] = useState(
    initialData?.images?.length > 0
      ? initialData.images
      : initialData?.image
      ? [{ url: initialData.image, publicId: '' }]
      : []
  );

  // Multi-size Variants Manager
  const [variants, setVariants] = useState(
    initialData?.variants?.length > 0
      ? initialData.variants
      : [
          {
            label: '100g',
            weightInGrams: 100,
            price: 189,
            mrp: 249,
            stock: 50,
            sku: 'FD-PROD-100G',
          },
        ]
  );

  // Unsaved Changes Tracking
  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Sync initialData if updated (e.g., loaded asynchronously in Edit page)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setIsSlugManual(Boolean(initialData.slug));
      setCategoryId(
        (typeof initialData.category === 'object'
          ? initialData.category?._id
          : initialData.category) || ''
      );
      setTagline(initialData.tagline || '');
      setShortDescription(initialData.shortDescription || '');
      setDescription(initialData.description || '');
      if (initialData.highlights?.length) setHighlights(initialData.highlights);
      setIngredients(initialData.ingredients || '');
      setShelfLife(initialData.shelfLife || '');
      setStorageInstructions(initialData.storageInstructions || '');
      setAccentColor(initialData.accentColor || '#1F6B3A');
      if (initialData.tags) setTags(initialData.tags);
      setIsFeatured(Boolean(initialData.isFeatured));
      setIsActive(initialData.isActive !== false);
      if (initialData.images?.length) setImages(initialData.images);
      else if (initialData.image) setImages([{ url: initialData.image, publicId: '' }]);
      if (initialData.variants?.length) setVariants(initialData.variants);
      setIsDirty(false);
    }
  }, [initialData]);

  // Auto-generate slug from name if not manually modified
  const handleNameChange = (val) => {
    setName(val);
    setIsDirty(true);
    if (!isSlugManual) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Warn on page unload if changes are unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Highlights handlers
  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setHighlights([...highlights, newHighlight.trim()]);
    setNewHighlight('');
    setIsDirty(true);
  };

  const handleRemoveHighlight = (idx) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  // Tags handlers
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,+|,+$/g, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
        setIsDirty(true);
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setIsDirty(true);
  };

  // Variants Manager handlers
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        label: '250g',
        weightInGrams: 250,
        price: 399,
        mrp: 499,
        stock: 30,
        sku: '',
      },
    ]);
    setIsDirty(true);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    const isNum = ['price', 'mrp', 'stock', 'weightInGrams'].includes(field);
    updated[index][field] = isNum ? (value === '' ? '' : Number(value)) : value;
    setVariants(updated);
    setIsDirty(true);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) {
      toast.error('Product must have at least one variant');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // Form Submission
  const handleSubmitForm = (saveActiveState = isActive) => {
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!slug.trim()) {
      toast.error('Product slug is required');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (variants.length === 0) {
      toast.error('Please configure at least one product variant');
      return;
    }
    for (const v of variants) {
      if (!v.label) {
        toast.error('All variants must have a label (e.g. 100g)');
        return;
      }
      if (!v.price || v.price <= 0) {
        toast.error('Variant prices must be positive numbers');
        return;
      }
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      category: categoryId,
      tagline: tagline.trim(),
      shortDescription: shortDescription.trim() || tagline.trim(),
      description: description.trim(),
      highlights,
      ingredients: ingredients.trim(),
      shelfLife: shelfLife.trim(),
      storageInstructions: storageInstructions.trim(),
      accentColor,
      tags,
      isFeatured,
      isActive: saveActiveState,
      variants,
      images,
    };

    setIsDirty(false);
    onSubmit(payload);
  };

  return (
    <div className="space-y-8 font-body max-w-5xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isDirty) setShowExitConfirm(true);
              else navigate('/admin/products');
            }}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-gray-900 tracking-tight">
              {isEdit ? `Edit Product: ${name || 'Details'}` : 'Create New Product'}
            </h1>
            <p className="text-xs text-gray-500">
              {isDirty ? 'You have unsaved changes' : 'All changes synced'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSubmitForm(false)}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={submitting}
            icon={Save}
            iconPosition="left"
            onClick={() => handleSubmitForm(true)}
          >
            {isEdit ? 'Update & Publish' : 'Publish Product'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Basic Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-soft space-y-5">
          <h3 className="text-base font-heading font-black text-gray-900">
            Basic Identification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Product Name <span className="text-brandRed">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Crisp Apple Slices"
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold border border-gray-200 focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category <span className="text-brandRed">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold border border-gray-200 focus:outline-none focus:border-primary cursor-pointer"
                required
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                URL Slug <span className="text-brandRed">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                  /product/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugManual(true);
                    setIsDirty(true);
                  }}
                  placeholder="crisp-apple-slices"
                  className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-mono border border-gray-200 focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="e.g. Naturally Sun-Sweet & Crunch-Packed"
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* 2. Image Gallery Uploader */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-heading font-black text-gray-900">
              Product Images Gallery
            </h3>
            <span className="text-xs text-primary font-bold">
              {images.length} images added
            </span>
          </div>

          <ImageUploader
            images={images}
            onChange={(newImgs) => {
              setImages(newImgs);
              setIsDirty(true);
            }}
            maxImages={6}
          />
        </div>

        {/* 3. Variants Manager */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-black text-gray-900">
                Size & Weight Variants
              </h3>
              <p className="text-xs text-gray-400">
                Manage stock levels, MRP discount anchors, weights, and SKU codes
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddVariant}
            >
              Add Variant Row
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Label (e.g. 100g)</th>
                  <th className="py-2.5 px-3">Grams</th>
                  <th className="py-2.5 px-3">Selling Price (₹)</th>
                  <th className="py-2.5 px-3">MRP (₹)</th>
                  <th className="py-2.5 px-3">Stock Units</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((v, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={v.label}
                        onChange={(e) => handleVariantChange(idx, 'label', e.target.value)}
                        placeholder="100g"
                        className="w-24 bg-white rounded-xl px-2.5 py-1.5 border border-gray-200 font-bold"
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={v.weightInGrams}
                        onChange={(e) =>
                          handleVariantChange(idx, 'weightInGrams', e.target.value)
                        }
                        placeholder="100"
                        className="w-20 bg-white rounded-xl px-2.5 py-1.5 border border-gray-200"
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                        placeholder="189"
                        className="w-24 bg-white rounded-xl px-2.5 py-1.5 border border-gray-200 font-bold text-primary"
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={v.mrp}
                        onChange={(e) => handleVariantChange(idx, 'mrp', e.target.value)}
                        placeholder="249"
                        className="w-24 bg-white rounded-xl px-2.5 py-1.5 border border-gray-200 text-gray-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                        placeholder="50"
                        className="w-20 bg-white rounded-xl px-2.5 py-1.5 border border-gray-200"
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        placeholder="FD-SKU"
                        className="w-28 bg-white rounded-xl px-2.5 py-1.5 border border-gray-200 font-mono text-[11px]"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        disabled={variants.length <= 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brandRed hover:bg-red-50 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Descriptions & Dynamic Highlights */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-soft space-y-5">
          <h3 className="text-base font-heading font-black text-gray-900">
            Description & Selling Highlights
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Short Description (Summary)
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => {
                setShortDescription(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Crisp dehydrated apple crisps packed with rich dietary fiber..."
              className="w-full bg-gray-50 rounded-2xl p-3 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Full Product Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Hand-selected from Himalayan orchards, gently dried..."
              className="w-full bg-gray-50 rounded-2xl p-3 text-xs sm:text-sm border border-gray-200 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Dynamic Highlights List */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <label className="block text-xs font-bold text-gray-700">
              Key Highlights (Checklist bullets)
            </label>

            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 bg-gray-50 px-3.5 py-2 rounded-2xl border border-gray-100"
                >
                  <span className="text-xs text-gray-700 flex-1">{h}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(i)}
                    className="p-1 rounded-lg text-gray-400 hover:text-brandRed hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                placeholder="Add bullet highlight (e.g. Zero Added Sugar)..."
                className="flex-1 bg-gray-50 rounded-2xl px-4 py-2 text-xs border border-gray-200 focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-3.5 py-2 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
              >
                Add Highlight
              </button>
            </div>
          </div>
        </div>

        {/* 5. Food Specifications & Accent Styling */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-soft space-y-5">
          <h3 className="text-base font-heading font-black text-gray-900">
            Nutritional Specs & Brand Presentation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ingredients
              </label>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => {
                  setIngredients(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full bg-gray-50 rounded-2xl px-4 py-2 text-xs border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Shelf Life
              </label>
              <input
                type="text"
                value={shelfLife}
                onChange={(e) => {
                  setShelfLife(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full bg-gray-50 rounded-2xl px-4 py-2 text-xs border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Storage Instructions
              </label>
              <input
                type="text"
                value={storageInstructions}
                onChange={(e) => {
                  setStorageInstructions(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full bg-gray-50 rounded-2xl px-4 py-2 text-xs border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Accent Color Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-primary" />
                <span>Card Accent Color</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => {
                    setAccentColor(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => {
                    setAccentColor(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-24 bg-gray-50 rounded-xl px-3 py-2 text-xs font-mono font-bold border border-gray-200"
                />
                <div className="flex items-center gap-1.5 ml-2">
                  {COLOR_PRESETS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        setAccentColor(col);
                        setIsDirty(true);
                      }}
                      className="w-6 h-6 rounded-full border border-black/10 transition-transform hover:scale-110"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>Tags (Press Enter to add)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-brandRed"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter..."
                className="w-full bg-gray-50 rounded-2xl px-4 py-2 text-xs border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 pt-2 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => {
                    setIsFeatured(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                />
                <span className="text-xs font-bold text-gray-800">
                  Feature this product on homepage hero & top selections
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => {
                    setIsActive(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                />
                <span className="text-xs font-bold text-gray-800">
                  Publish to active public catalog immediately
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showExitConfirm}
        title="Unsaved Changes"
        message="You have unsaved modifications in this product form. Are you sure you want to abandon these changes and return to the products list?"
        confirmText="Discard Changes"
        cancelText="Stay on Page"
        variant="warning"
        onConfirm={() => {
          setIsDirty(false);
          setShowExitConfirm(false);
          navigate('/admin/products');
        }}
        onCancel={() => setShowExitConfirm(false)}
      />
    </div>
  );
}
