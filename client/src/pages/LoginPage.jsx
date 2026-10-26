import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuthStore();
  const { syncGuestCartOnLogin, fetchCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    const result = await login(values);
    setIsSubmitting(false);

    if (result.success) {
      await syncGuestCartOnLogin();
      await fetchCart(true);
      if (result.user.role === 'admin' && redirect === '/') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setValue('email', 'admin@fyndry.com');
      setValue('password', 'AdminPassword123!');
    } else {
      setValue('email', 'customer@fyndry.com');
      setValue('password', 'CustomerPassword123!');
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-soft border border-cream-dark"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-soft mb-3">
            <Leaf className="w-6 h-6 text-cream fill-cream transform -rotate-12" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900">
            Welcome to FynDry
          </h1>
          <p className="text-xs text-gray-500 font-body mt-1">
            Sign in to manage your addresses, orders, and checkout seamlessly
          </p>
        </div>

        {/* Quick Demo Autofill Bar */}
        <div className="mb-6 p-3 rounded-2xl bg-cream border border-cream-dark">
          <span className="text-[11px] font-bold uppercase tracking-wider text-woodBrown block mb-2 text-center">
            One-Click Test Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white rounded-xl text-xs font-bold text-primary border border-primary/20 hover:bg-primary-50 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('customer')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white rounded-xl text-xs font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customer Demo</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...register('email')}
                type="email"
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-cream-light font-body"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-brandRed font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm bg-cream-light font-body"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-brandRed font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-heading font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-600">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
