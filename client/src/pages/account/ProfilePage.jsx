import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Phone, Lock, Save, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authApi from '../../api/authApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be a valid 10-digit number'),
  avatar: z.string().url('Avatar must be a valid URL').or(z.literal('')),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data) => {
    setProfileLoading(true);
    try {
      const res = await authApi.updateProfile(data);
      const updatedUser = res.data?.user || res.data;
      setUser(updatedUser);
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-body">
      {/* 1. Profile Information Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
        <h3 className="text-xl font-heading font-black text-gray-900 mb-1">
          Personal Information
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Update your contact details for order delivery updates.
        </p>

        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4 max-w-xl">
          <Input
            label="Full Name"
            icon={User}
            error={profileErrors.name?.message}
            required
            {...registerProfile('name')}
          />

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 font-body">
              Email Address (Cannot be changed)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full font-body rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            icon={Phone}
            placeholder="10-digit mobile number"
            error={profileErrors.phone?.message}
            required
            {...registerProfile('phone')}
          />

          <Button
            type="submit"
            variant="primary"
            loading={profileLoading}
            icon={Save}
            iconPosition="left"
            className="mt-2"
          >
            Save Changes
          </Button>
        </form>
      </div>

      {/* 2. Change Password Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
        <h3 className="text-xl font-heading font-black text-gray-900 mb-1">
          Security & Password
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Ensure your account is using a secure password.
        </p>

        <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4 max-w-xl">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={passwordErrors.currentPassword?.message}
            required
            {...registerPassword('currentPassword')}
          />

          <Input
            label="New Password"
            type="password"
            icon={Lock}
            placeholder="At least 6 characters"
            error={passwordErrors.newPassword?.message}
            required
            {...registerPassword('newPassword')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            placeholder="Repeat new password"
            error={passwordErrors.confirmPassword?.message}
            required
            {...registerPassword('confirmPassword')}
          />

          <Button
            type="submit"
            variant="secondary"
            loading={passwordLoading}
            icon={ShieldCheck}
            iconPosition="left"
            className="mt-2"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
