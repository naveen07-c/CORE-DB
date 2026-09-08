import React, { useState } from 'react';
import { MapPin, Plus, CheckCircle2, Home, Briefcase, Building, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { useAuthStore } from '../../store/useAuthStore';

export const AddressSelector = ({ selectedAddressId, onSelectAddress }) => {
  const { addresses, addAddress, removeAddress } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'HOME',
    isDefault: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await addAddress(formData);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        addressType: 'HOME',
        isDefault: false,
      });
    } catch (err) {
      setFormError(err.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'OFFICE':
      case 'WORK':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'OTHER':
        return <Building className="w-3.5 h-3.5" />;
      default:
        return <Home className="w-3.5 h-3.5" />;
    }
  };

  const normalizeType = (type) => (type === 'WORK' ? 'OFFICE' : type);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-600" />
          1. Select Delivery Address
        </h3>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-bold text-ink hover:text-brand-600 bg-cream hover:bg-brand-50 px-3 py-1.5 rounded-xl border-2 border-ink/10 hover:border-brand-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Address
        </button>
      </div>

      {/* Address Grid */}
      {addresses.length === 0 ? (
        <div className="p-6 bg-cream rounded-3xl border border-dashed border-ink/20 text-center space-y-3">
          <MapPin className="w-8 h-8 text-ink/30 mx-auto" />
          <p className="text-xs text-ink/60">No delivery addresses yet — add one to get started.</p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-primary !py-2 !px-5 text-xs"
          >
            Add Shipping Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const addrId = addr.addressId || addr.address_id;
            const isSelected = selectedAddressId === addrId;
            const addrType = normalizeType(addr.addressType || addr.address_type || 'HOME');

            return (
              <div
                key={addrId}
                onClick={() => onSelectAddress(addrId)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-ink bg-peach/60 shadow-md'
                    : 'border-ink/10 bg-white hover:border-brand-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink">{addr.fullName || addr.full_name}</span>
                      <Badge variant="primary" size="sm">
                        {getTypeIcon(addrType)}
                        {addrType}
                      </Badge>
                    </div>

                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-brand-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-ink/15" />
                    )}
                  </div>

                  <p className="text-xs text-ink/70 leading-relaxed">
                    {addr.addressLine1 || addr.address_line1}
                    {(addr.addressLine2 || addr.address_line2) && `, ${addr.addressLine2 || addr.address_line2}`}
                  </p>
                  <p className="text-xs text-ink/50">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-ink/5 flex items-center justify-between text-[11px] text-ink/50">
                  <span>Phone: {addr.phone}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAddress(addrId);
                    }}
                    className="p-1 text-ink/40 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Address Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="input !rounded-2xl !py-2.5 !text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input !rounded-2xl !py-2.5 !text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1">
              Address Line 1 (Flat, House No, Street) *
            </label>
            <input
              type="text"
              required
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              className="input !rounded-2xl !py-2.5 !text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1">
              Address Line 2 (Apartment, Landmark)
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              className="input !rounded-2xl !py-2.5 !text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1">
                City *
              </label>
              <input
                type="text"
                required
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="input !rounded-2xl !py-2.5 !text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1">
                State *
              </label>
              <input
                type="text"
                required
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="input !rounded-2xl !py-2.5 !text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                required
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="input !rounded-2xl !py-2.5 !text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-2">
              Address Type
            </label>
            <div className="flex gap-4">
              {['HOME', 'OFFICE', 'OTHER'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink/70">
                  <input
                    type="radio"
                    name="addressType"
                    value={type}
                    checked={formData.addressType === type}
                    onChange={handleInputChange}
                    className="accent-brand-500"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-ink/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary !py-2 !px-5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary !py-2 !px-6 text-xs disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
