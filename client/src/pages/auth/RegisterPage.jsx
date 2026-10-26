import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be a valid 10-digit number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { register: registerUser } = useAuthStore();
  const { mergeGuestCart, fetchCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    const result = await registerUser(values);
    setIsSubmitting(false);

    if (result.success) {
      await mergeGuestCart();
      await fetchCart(true);
      navigate(redirect);
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
          Create an Account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Join FynDry for quick checkout and order delivery tracking.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          icon={User}
          placeholder="e.g. Radhika Patel"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="radhika@example.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Phone Number"
          type="tel"
          icon={Phone}
          placeholder="10-digit mobile number"
          error={errors.phone?.message}
          required
          {...register('phone')}
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="At least 6 characters"
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
          Create Account
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span>Your data is protected and never shared with 3rd parties</span>
      </div>

      <p className="mt-4 text-center text-xs text-gray-600">
        Already have an account?{' '}
        <Link
          to={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="font-bold text-primary hover:underline"
        >
          Sign In
        </Link>
      </p>
    </motion.div>
  );
}
