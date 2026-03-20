import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';
import Button from '../common/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  'Unlimited score entries',
  'Monthly charity draw entry',
  'Choose your charity',
  'Real-time draw results',
  'Personal stats dashboard',
  'Community leaderboard access',
  'Winner verification system',
];

export default function PlanCard({ plan, onSubscribe, loading, disabled }) {
  const isPopular = plan.id === 'yearly';

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={`relative rounded-3xl p-8 border-2 transition-shadow duration-300 ${
        isPopular
          ? 'border-primary-500 shadow-lg shadow-primary-100'
          : 'border-gray-100 hover:shadow-md'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {plan.id === 'yearly' && (
        <div className="absolute top-4 right-4">
          <span className="bg-accent-100 text-accent-700 text-xs font-bold px-2.5 py-1 rounded-full">
            Save 17%
          </span>
        </div>
      )}

      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

      <div className="mt-6 mb-8">
        <span className="text-4xl font-extrabold text-gray-900">
          &pound;{plan.price}
        </span>
        <span className="text-gray-400 text-sm">{plan.period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-accent-500 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isPopular ? 'primary' : 'outline'}
        className="w-full"
        onClick={() => onSubscribe(plan.id)}
        loading={loading}
        disabled={disabled}
      >
        Subscribe Now
      </Button>
    </motion.div>
  );
}
