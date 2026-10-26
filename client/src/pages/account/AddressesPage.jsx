import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Plus, AlertCircle } from 'lucide-react';
import addressApi from '../../api/addressApi';
import AddressModal from '../../components/AddressModal';
import AddressCard from '../../components/common/AddressCard';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Saved Addresses | FynDry Account';
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await addressApi.getAddresses();
      const list = Array.isArray(res.data) ? res.data : (res.data?.addresses || []);
      setAddresses(list);
    } catch (err) {
      toast.error('Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSaveAddress = async (payload) => {
    setSaving(true);
    try {
      if (editingAddress) {
        await addressApi.updateAddress(editingAddress._id, payload);
        toast.success('Address updated successfully');
      } else {
        await addressApi.createAddress(payload);
        toast.success('New delivery address saved');
      }
      setModalOpen(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await addressApi.deleteAddress(id);
      toast.success('Address removed');
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressApi.setDefaultAddress(id);
      toast.success('Default delivery address updated');
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set default address');
    }
  };

  return (
    <div className="space-y-6 font-body">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <h3 className="text-xl font-heading font-black text-gray-900">
              Delivery Address Book
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Saved addresses with exact GPS drop-off coordinates ({addresses.length}/10 max).
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={addresses.length >= 10}
            onClick={() => {
              setEditingAddress(null);
              setModalOpen(true);
            }}
            icon={Plus}
            iconPosition="left"
            className="self-start sm:self-auto"
          >
            Add New Address
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center">
            <Spinner size="md" />
            <p className="mt-3 text-xs text-gray-500 font-bold">Loading your saved addresses...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && addresses.length === 0 && (
          <EmptyState
            icon={MapPin}
            title="No Saved Addresses"
            description="Add your home or work address with live GPS coordinates for seamless checkout."
            actionText="Add Delivery Address"
            onAction={() => {
              setEditingAddress(null);
              setModalOpen(true);
            }}
            className="my-8"
          />
        )}

        {/* Address Cards Grid */}
        {!loading && addresses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {addresses.map((addr) => (
              <AddressCard
                key={addr._id}
                address={addr}
                onEdit={(a) => {
                  setEditingAddress(a);
                  setModalOpen(true);
                }}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Address Modal with Map Location Picker */}
      <AddressModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        initialData={editingAddress}
        loading={saving}
      />
    </div>
  );
}
