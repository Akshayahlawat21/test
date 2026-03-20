import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';

export default function SubscriptionGate({ children }) {
  const { user } = useAuth();

  if (user?.subscription?.status === 'active') {
    return children;
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mb-4">
        <ShieldExclamationIcon className="h-8 w-8 text-warm-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Active Subscription Required
      </h3>
      <p className="text-gray-500 max-w-md mb-6">
        You need an active subscription to access this feature. Subscribe today
        to start entering scores, join draws, and support charities.
      </p>
      <Link to="/pricing">
        <Button>View Plans & Subscribe</Button>
      </Link>
    </div>
  );
}
