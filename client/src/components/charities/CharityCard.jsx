import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const gradients = [
  'from-emerald-400 to-teal-600',
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',
  'from-orange-400 to-red-500',
  'from-cyan-400 to-blue-600',
  'from-rose-400 to-fuchsia-600',
];

export default function CharityCard({ charity, index = 0 }) {
  const gradient = gradients[index % gradients.length];
  const imageUrl = charity.images?.[0]?.url;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Image / Placeholder */}
      <div className="relative h-40 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={charity.images[0]?.alt || charity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <HeartIcon className="h-12 w-12 text-white/80" />
          </div>
        )}
        {charity.featured && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            <StarIcon className="h-3.5 w-3.5" />
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {charity.name}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {charity.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">
              &pound;{(charity.totalReceived || 0).toLocaleString()} raised
            </span>
          </div>
          <Link
            to={`/charities/${charity.slug}`}
            className="text-sm font-semibold text-accent-600 hover:text-accent-700 transition-colors"
          >
            Learn more &rarr;
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
