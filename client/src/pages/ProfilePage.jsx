import React, { useState } from 'react';
import { User, MapPin, Plus, Trash2, Check, Navigation, ShieldCheck, Mail, Calendar } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import AddressModal from '../components/AddressModal';

export default function ProfilePage() {
  const { user, addAddress, deleteAddress, setDefaultAddress } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveAddress = async (data) => {
    await addAddress(data);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
          Account <span className="text-primary">Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your personal details and multiple delivery doorstep addresses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Personal info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-heading font-black text-3xl flex items-center justify-center mx-auto mb-4 shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <h2 className="font-heading font-bold text-xl text-gray-900">{user?.name}</h2>
            <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>{user?.email}</span>
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 text-primary border border-primary/20">
                {user?.role === 'admin' ? 'Store Administrator' : 'Verified Customer'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Address Book */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="font-heading font-bold text-xl text-gray-900">Saved Addresses</h3>
                <p className="text-xs text-gray-500">
                  Addresses with GPS coordinates help our drivers deliver accurately
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-primary bg-primary-50 hover:bg-primary-100 border border-primary/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            </div>

            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr) => {
                  const hasCoordinates =
                    addr.location?.coordinates &&
                    (addr.location.coordinates[0] !== 0 || addr.location.coordinates[1] !== 0);

                  return (
                    <div
                      key={addr._id}
                      className="p-4 rounded-2xl border border-gray-200 bg-cream-light/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-heading font-bold text-sm text-gray-900">
                            {addr.fullName}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold uppercase bg-primary-100 text-primary px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 font-medium">{addr.phone}</p>
                        <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                          {addr.street}
                          {addr.landmark ? `, ${addr.landmark}` : ''}
                          <br />
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </p>

                        {hasCoordinates && (
                          <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            <Navigation className="w-3 h-3" />
                            <span>GPS: {addr.location.coordinates[1].toFixed(4)}, {addr.location.coordinates[0].toFixed(4)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => setDefaultAddress(addr._id)}
                            className="font-bold text-primary hover:underline"
                          >
                            Set Default
                          </button>
                        ) : (
                          <span className="text-gray-400 font-medium">Default Address</span>
                        )}

                        <button
                          onClick={() => deleteAddress(addr._id)}
                          className="text-gray-400 hover:text-brandRed p-1 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-cream/40 rounded-2xl border border-cream-dark p-6">
                <MapPin className="w-8 h-8 text-woodBrown mx-auto mb-2" />
                <h4 className="font-heading font-bold text-gray-800 text-sm">
                  No addresses saved yet
                </h4>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Add an address to speed up your checkout with live location
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
                >
                  Add Your First Address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
      />
    </div>
  );
}
