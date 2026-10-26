import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuthStore();
  const { mergeGuestCart, fetchCart } = useCartStore();
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
      await mergeGuestCart();
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
      setValue('password', 'Admin@FynDry');
    } else {
      setValue('email', 'customer@fyndry.com');
      setValue('password', 'CustomerPassword123!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-body"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Sign in to access your saved addresses and order tracking.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="your.email@example.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          required
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="w-full mt-2"
          icon={ArrowRight}
          iconPosition="right"
        >
          Sign In
        </Button>
      </form>

      {/* Quick Demo Credential Fillers for testing */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-3">
          Quick Demo Credentials
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill('customer')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cream hover:bg-cream-dark text-xs font-bold text-gray-700 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('admin')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary-50 hover:bg-primary-100 text-xs font-bold text-primary transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-600">
        Don't have an account yet?{' '}
        <Link
          to={`/register?redirect=${encodeURIComponent(redirect)}`}
          className="font-bold text-primary hover:underline"
        >
          Create Account
        </Link>
      </p>
    </motion.div>
  );
}
