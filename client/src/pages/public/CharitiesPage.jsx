import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import CharityCard from '../../components/charities/CharityCard';
import { getCharities } from '../../api/charities';

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="flex justify-between mt-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [featured, setFeatured] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCharities = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (featured) params.featured = 'true';

      const { data } = await getCharities(params);
      setCharities(data.charities);
      setPagination(data.pagination);
    } catch {
      setCharities([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, featured, page]);

  useEffect(() => {
    fetchCharities();
  }, [fetchCharities]);

  const handleFeaturedToggle = () => {
    setFeatured((prev) => !prev);
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent-50 to-accent-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4"
          >
            Our Charities
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto mb-8"
          >
            Choose the cause closest to your heart. Every draw, every win, every
            subscription helps these incredible organisations.
          </motion.p>

          {/* Search + Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto flex items-center gap-3"
          >
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search charities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition"
              />
            </div>
            <button
              onClick={handleFeaturedToggle}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                featured
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              Featured
            </button>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : charities.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {charities.map((charity, idx) => (
                <CharityCard
                  key={charity._id}
                  charity={charity}
                  index={idx}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-2">
                No charities found matching your search.
              </p>
              <p className="text-gray-400 text-sm">
                Try a different search term or remove filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      p === page
                        ? 'bg-accent-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
