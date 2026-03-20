import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CurrencyPoundIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import CharityCard from '../../components/charities/CharityCard';
import DonationModal from '../../components/charities/DonationModal';
import { getCharities, updateUserCharity } from '../../api/charities';
import { useAuth } from '../../hooks/useAuth';

export default function MyCharityPage() {
  const { user, updateUser } = useAuth();
  const [currentCharity, setCurrentCharity] = useState(null);
  const [contributionPercent, setContributionPercent] = useState(
    user?.charity?.contributionPercent || 10
  );
  const [saving, setSaving] = useState(false);
  const [loadingCharity, setLoadingCharity] = useState(true);

  // Charity selection mode
  const [selectMode, setSelectMode] = useState(false);
  const [charities, setCharities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loadingList, setLoadingList] = useState(false);

  // Donation modal
  const [donationOpen, setDonationOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch current charity
  useEffect(() => {
    const fetchCurrent = async () => {
      if (!user?.charity?.charityId) {
        setLoadingCharity(false);
        return;
      }
      try {
        // We need to find the charity by its ID - fetch all and find, or use slug
        // Since we store charityId, let's fetch all charities and find ours
        const { data } = await getCharities({ limit: 100 });
        const found = data.charities.find(
          (c) => c._id === user.charity.charityId
        );
        if (found) setCurrentCharity(found);
      } catch {
        // Silently fail
      } finally {
        setLoadingCharity(false);
      }
    };
    fetchCurrent();
  }, [user?.charity?.charityId]);

  // Fetch charity list for selection
  const fetchCharitiesList = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = { limit: 50 };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await getCharities(params);
      setCharities(data.charities);
    } catch {
      setCharities([]);
    } finally {
      setLoadingList(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (selectMode) fetchCharitiesList();
  }, [selectMode, fetchCharitiesList]);

  const handleSelectCharity = async (charity) => {
    setSaving(true);
    try {
      const { data } = await updateUserCharity({
        charityId: charity._id,
        contributionPercent,
      });
      setCurrentCharity(charity);
      setContributionPercent(data.charity.contributionPercent);
      setSelectMode(false);
      // Update user context
      updateUser({
        charity: {
          charityId: charity._id,
          contributionPercent: data.charity.contributionPercent,
        },
      });
      toast.success(`Now supporting ${charity.name}!`);
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'Failed to update charity selection.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContribution = async () => {
    if (!currentCharity) return;
    setSaving(true);
    try {
      await updateUserCharity({
        charityId: currentCharity._id,
        contributionPercent,
      });
      updateUser({
        charity: {
          ...user.charity,
          contributionPercent,
        },
      });
      toast.success('Contribution percentage updated!');
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'Failed to update contribution.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Charity</h1>
        <p className="text-gray-500 text-sm mb-8">
          Manage your charity selection and see your impact
        </p>

        <AnimatePresence mode="wait">
          {selectMode ? (
            /* ----- Charity Selection Mode ----- */
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Choose a Charity
                </h2>
                <button
                  onClick={() => setSelectMode(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search charities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition"
                />
              </div>

              {loadingList ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-100 bg-white animate-pulse h-48"
                    />
                  ))}
                </div>
              ) : charities.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {charities.map((charity) => (
                    <motion.div
                      key={charity._id}
                      whileHover={{ scale: 1.01 }}
                      className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                        currentCharity?._id === charity._id
                          ? 'border-accent-500 bg-accent-50 shadow-sm'
                          : 'border-gray-100 bg-white hover:shadow-md hover:border-gray-200'
                      }`}
                      onClick={() => handleSelectCharity(charity)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shrink-0">
                          {charity.images?.[0]?.url ? (
                            <img
                              src={charity.images[0].url}
                              alt={charity.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <HeartIcon className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {charity.name}
                            </h3>
                            {currentCharity?._id === charity._id && (
                              <CheckCircleIcon className="h-5 w-5 text-accent-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {charity.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            &pound;{(charity.totalReceived || 0).toLocaleString()}{' '}
                            raised
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No charities found.</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* ----- Main View ----- */
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {loadingCharity ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-40" />
                      <div className="h-4 bg-gray-100 rounded w-60" />
                    </div>
                  </div>
                </div>
              ) : currentCharity ? (
                <>
                  {/* Current Charity Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shrink-0">
                        {currentCharity.images?.[0]?.url ? (
                          <img
                            src={currentCharity.images[0].url}
                            alt={currentCharity.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <HeartIcon className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-bold text-gray-900">
                            {currentCharity.name}
                          </h2>
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                          {currentCharity.description}
                        </p>
                        <p className="text-xs text-accent-600 font-semibold mt-2">
                          &pound;
                          {(currentCharity.totalReceived || 0).toLocaleString()}{' '}
                          raised so far
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contribution Slider */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      Contribution Percentage
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Choose what percentage of your subscription goes to this
                      charity (minimum 10%).
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={contributionPercent}
                        onChange={(e) =>
                          setContributionPercent(parseInt(e.target.value))
                        }
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-500"
                      />
                      <span className="text-lg font-bold text-accent-600 w-14 text-right">
                        {contributionPercent}%
                      </span>
                    </div>
                    <Button
                      onClick={handleSaveContribution}
                      loading={saving}
                      size="sm"
                    >
                      Save Percentage
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setDonationOpen(true)}
                    >
                      <CurrencyPoundIcon className="h-4 w-4 mr-2" />
                      Make a Donation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectMode(true)}
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Change Charity
                    </Button>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-8">
                  <EmptyState
                    icon={HeartIcon}
                    title="No Charity Selected"
                    description="Choose a charity to support. A portion of your subscription will go directly to your chosen cause."
                    actionLabel="Choose a Charity"
                    onAction={() => setSelectMode(true)}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Donation Modal */}
      {currentCharity && (
        <DonationModal
          isOpen={donationOpen}
          onClose={() => setDonationOpen(false)}
          charity={currentCharity}
        />
      )}
    </div>
  );
}
