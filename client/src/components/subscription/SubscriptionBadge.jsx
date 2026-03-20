import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  MinusCircleIcon,
} from '@heroicons/react/24/solid';

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-green-50 text-green-700 border-green-200',
    dotClass: 'bg-green-500',
    Icon: CheckCircleIcon,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dotClass: 'bg-yellow-500',
    Icon: ExclamationTriangleIcon,
  },
  lapsed: {
    label: 'Lapsed',
    className: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
    Icon: XCircleIcon,
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-gray-50 text-gray-500 border-gray-200',
    dotClass: 'bg-gray-400',
    Icon: MinusCircleIcon,
  },
};

export default function SubscriptionBadge({ status = 'inactive', size = 'md' }) {
  const config = statusConfig[status] || statusConfig.inactive;
  const { Icon } = config;

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.className} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {config.label}
    </span>
  );
}
