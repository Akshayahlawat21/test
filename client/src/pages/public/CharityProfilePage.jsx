import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  CurrencyPoundIcon,
  CalendarIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import DonationModal from '../../components/charities/DonationModal';
import { getCharity } from '../../api/charities';

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <section className="bg-gradient-to-br from-accent-50 to-accent-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-200" />
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6">
                <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-2" />
                <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CharityProfilePage() {
  const { slug } = useParams();
  const [charity, setCharity] = useState(null);
  const [supporterCount, setSupporterCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donationOpen, setDonationOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchCharity = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getCharity(slug);
        setCharity(data.charity);
        setSupporterCount(data.supporterCount);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Charity not found.'
            : 'Failed to load charity details.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCharity();
  }, [slug]);

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 text-lg mb-4">{error}</p>
        <Link to="/charities">
          <Button variant="outline">Back to Charities</Button>
        </Link>
      </div>
    );
  }

  const images = charity.images || [];
  const upcomingEvents = (charity.events || [])
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const prevImage = () =>
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent-50 to-accent-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/charities"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Charities
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-accent-500 flex items-center justify-center shrink-0">
              {images.length > 0 ? (
                <img
                  src={images[0].url}
                  alt={images[0].alt || charity.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <HeartIcon className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {charity.name}
              </h1>
              <p className="text-gray-500 mt-1">
                {charity.featured ? 'Featured Charity' : 'Registered Charity'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Carousel */}
      {images.length > 1 && (
        <section className="bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80">
              <motion.img
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={images[currentImage].url}
                alt={images[currentImage].alt || charity.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-700" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentImage
                        ? 'bg-white scale-110'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats + Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6 mb-12"
          >
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CurrencyPoundIcon className="h-5 w-5 text-accent-500" />
                <p className="text-2xl font-bold text-gray-900">
                  &pound;{(charity.totalReceived || 0).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-500">Total Raised</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <UserGroupIcon className="h-5 w-5 text-accent-500" />
                <p className="text-2xl font-bold text-gray-900">
                  {supporterCount}
                </p>
              </div>
              <p className="text-sm text-gray-500">Supporters</p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-500 leading-relaxed whitespace-pre-line">
              {charity.description}
            </p>
          </motion.div>

          {/* Events */}
          {upcomingEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Upcoming Events
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setDonationOpen(true)}
            >
              <HeartIcon className="h-5 w-5 mr-2" />
              Support This Charity
            </Button>
            <Link to="/charities">
              <Button variant="outline" size="lg">
                View All Charities
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Donation Modal */}
      {charity && (
        <DonationModal
          isOpen={donationOpen}
          onClose={() => setDonationOpen(false)}
          charity={charity}
        />
      )}
    </div>
  );
}
