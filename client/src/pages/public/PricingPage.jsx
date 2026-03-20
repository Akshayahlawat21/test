import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { createCheckoutSession } from '../../api/subscriptions';
import PlanCard from '../../components/subscription/PlanCard';
import SubscriptionBadge from '../../components/subscription/SubscriptionBadge';
import Button from '../../components/common/Button';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '9.99',
    period: '/month',
    description: 'Perfect for getting started',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '99',
    period: '/year',
    description: 'Best value -- save 17%',
  },
];

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const isSubscribed = user?.subscription?.status === 'active';

  // Handle cancelled redirect
  useEffect(() => {
    if (searchParams.get('subscription') === 'cancelled') {
      toast('Subscription checkout was cancelled.', { icon: '!' });
    }
  }, [searchParams]);

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      toast.error('Please log in or create an account first.');
      return;
    }

    setLoadingPlan(planId);
    try {
      const { data } = await createCheckoutSession(planId);

      // If we have a Stripe publishable key, use Stripe.js redirect
      // Otherwise, redirect to the URL directly (Stripe Checkout hosted page)
      if (data.url) {
        window.location.href = data.url;
      } else if (stripePromise && data.sessionId) {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) {
          toast.error(error.message);
        }
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to start checkout. Please try again.';
      toast.error(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 to-warm-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            One subscription. Full access. A portion of every pound goes directly
            to the charities you choose.
          </motion.p>
        </div>
      </section>

      {/* Subscribed banner */}
      {isSubscribed && (
        <section className="py-6 bg-green-50 border-b border-green-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <SubscriptionBadge status="active" />
              <span className="text-green-800 font-medium">
                You&apos;re subscribed! Enjoy full access to all features.
              </span>
            </div>
            <Link to="/dashboard" className="inline-block mt-2">
              <Button variant="ghost" size="sm">Go to Dashboard</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSubscribe={handleSubscribe}
                loading={loadingPlan === plan.id}
                disabled={isSubscribed || (loadingPlan !== null && loadingPlan !== plan.id)}
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
            Cancel anytime. No lock-in contracts. Prices include VAT.
          </p>
        </div>
      </section>
    </div>
  );
}
