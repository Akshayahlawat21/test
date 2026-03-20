import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  PencilSquareIcon,
  TicketIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

const steps = [
  {
    icon: UserPlusIcon,
    title: 'Sign Up & Subscribe',
    description:
      'Create your free account, pick a charity you care about, and choose a monthly or yearly subscription plan. It takes less than 2 minutes.',
    color: 'bg-primary-100 text-primary-500',
  },
  {
    icon: PencilSquareIcon,
    title: 'Play Golf & Enter Scores',
    description:
      'After your round, log your real scores for each hole. Your 18-hole score is automatically converted into your unique draw entry numbers.',
    color: 'bg-warm-100 text-warm-600',
  },
  {
    icon: TicketIcon,
    title: 'Enter the Weekly Draw',
    description:
      'Each week, a draw takes place. If your score-based numbers match the winning combination, you win a cash prize. No extra cost beyond your subscription.',
    color: 'bg-accent-100 text-accent-600',
  },
  {
    icon: GiftIcon,
    title: 'Win & Your Charity Wins Too',
    description:
      'When you win, a percentage of the prize pool goes directly to your chosen charity. Even when nobody wins, charities still receive regular donations from the community fund.',
    color: 'bg-purple-100 text-purple-600',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.2 } },
};

export default function HowItWorksPage() {
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
            How It Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            Four simple steps from tee to charity donation. No complicated
            setup, no hidden fees, just golf with purpose.
          </motion.p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="space-y-12"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex gap-6"
              >
                <div className="shrink-0 flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${step.color}`}
                  >
                    <step.icon className="h-7 w-7" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-full bg-gray-200 mt-3" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-xs font-bold text-gray-300 uppercase mb-1">
                    Step {i + 1}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ / CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to make every round count?
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto mb-8">
            Join our community of golfers who play with purpose. Your next birdie
            could change someone&apos;s life.
          </p>
          <Link to="/register">
            <Button size="lg">Get Started Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
