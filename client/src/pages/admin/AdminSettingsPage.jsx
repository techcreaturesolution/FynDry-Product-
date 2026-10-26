import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Settings,
  Truck,
  Percent,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle,
  HelpCircle,
  CreditCard,
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [shippingFee, setShippingFee] = useState(49);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(499);
  const [gstPercentage, setGstPercentage] = useState(5);
  const [isCodEnabled, setIsCodEnabled] = useState(true);

  const [storeContact, setStoreContact] = useState({
    supportEmail: 'support@fyndry.com',
    supportPhone: '+91 98765 43210',
    address: '108 Greenfield Agro Estate, Nashik, Maharashtra 422001',
    businessHours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await adminApi.getSettings();
        const data = res.data?.data || res.data;
        if (data) {
          if (data.shippingFee !== undefined) setShippingFee(data.shippingFee);
          if (data.freeShippingThreshold !== undefined)
            setFreeShippingThreshold(data.freeShippingThreshold);
          if (data.gstPercentage !== undefined) setGstPercentage(data.gstPercentage);
          if (data.isCodEnabled !== undefined) setIsCodEnabled(data.isCodEnabled);
          if (data.storeContact) {
            setStoreContact((prev) => ({ ...prev, ...data.storeContact }));
          }
        }
      } catch (err) {
        toast.error('Failed to load store settings');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings({
        shippingFee: Number(shippingFee),
        freeShippingThreshold: Number(freeShippingThreshold),
        gstPercentage: Number(gstPercentage),
        isCodEnabled: Boolean(isCodEnabled),
        storeContact,
      });
      toast.success('Store settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center font-body">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-bold text-gray-500">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
          Store Configuration & Policies
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Configure fulfillment fees, tax calculations, payment methods, and public contact information.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Shipping & Delivery Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-soft space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-gray-900 text-base">
                Fulfillment & Delivery Charges
              </h3>
              <p className="text-xs text-gray-400">Manage rates applied during checkout calculation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold border border-gray-200 focus:outline-none focus:border-primary"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Charged on orders below the free shipping threshold.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold border border-gray-200 focus:outline-none focus:border-primary"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Orders equal or exceeding this subtotal qualify for complimentary shipping.
              </p>
            </div>
          </div>
        </div>

        {/* Taxes & Payment Options Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-soft space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-gray-900 text-base">
                Taxes & Checkout Methods
              </h3>
              <p className="text-xs text-gray-400">Government taxes & payment option toggles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Applicable GST / Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="28"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(e.target.value)}
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold border border-gray-200 focus:outline-none focus:border-primary"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Standard GST rate applied on dehydrated fruits & snacks (default: 5% or 12%).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Cash on Delivery (COD)
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isCodEnabled}
                  onChange={(e) => setIsCodEnabled(e.target.checked)}
                  className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Enable Cash on Delivery option
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Customers can choose Pay on Delivery at checkout
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Store Contact & Support Info Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-soft space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-gray-900 text-base">
                Customer Support & Store Contact
              </h3>
              <p className="text-xs text-gray-400">Displayed on invoices, packing slips, and public footer</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={storeContact.supportEmail}
                onChange={(e) =>
                  setStoreContact({ ...storeContact, supportEmail: e.target.value })
                }
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-body border border-gray-200 focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Support Phone / WhatsApp
              </label>
              <input
                type="text"
                value={storeContact.supportPhone}
                onChange={(e) =>
                  setStoreContact({ ...storeContact, supportPhone: e.target.value })
                }
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-body border border-gray-200 focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Physical Packing Facility / Business Address
              </label>
              <input
                type="text"
                value={storeContact.address}
                onChange={(e) =>
                  setStoreContact({ ...storeContact, address: e.target.value })
                }
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-body border border-gray-200 focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={storeContact.businessHours}
                onChange={(e) =>
                  setStoreContact({ ...storeContact, businessHours: e.target.value })
                }
                className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-body border border-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            icon={Save}
            iconPosition="left"
          >
            Save Store Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
