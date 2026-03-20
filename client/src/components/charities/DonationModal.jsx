import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, HeartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { createDonation } from '../../api/charities';
import toast from 'react-hot-toast';

const presetAmounts = [5, 10, 25, 50];

export default function DonationModal({ isOpen, onClose, charity }) {
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const effectiveAmount = isCustom ? parseFloat(customAmount) || 0 : amount;

  const handlePreset = (val) => {
    setAmount(val);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustom = () => {
    setIsCustom(true);
  };

  const handleSubmit = async () => {
    if (effectiveAmount < 1) {
      toast.error('Minimum donation is \u00a31');
      return;
    }
    if (effectiveAmount > 10000) {
      toast.error('Maximum donation is \u00a310,000');
      return;
    }

    setLoading(true);
    try {
      await createDonation({
        charityId: charity._id,
        amount: effectiveAmount,
      });
      setSuccess(true);
      toast.success('Donation successful! Thank you for your generosity.');
    } catch (err) {
      const msg =
        err.response?.data?.error || 'Donation failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setAmount(10);
    setCustomAmount('');
    setIsCustom(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl shadow-xl w-full max-w-md p-8 z-10"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {success ? (
            <div className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-500 mb-6">
                Your donation of &pound;{effectiveAmount.toFixed(2)} to{' '}
                {charity.name} has been processed successfully.
              </p>
              <Button onClick={handleClose}>Close</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <HeartIcon className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Make a Donation
                  </h3>
                  <p className="text-sm text-gray-500">to {charity.name}</p>
                </div>
              </div>

              {/* Preset amounts */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {presetAmounts.map((val) => (
                  <button
                    key={val}
                    onClick={() => handlePreset(val)}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                      !isCustom && amount === val
                        ? 'bg-accent-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    &pound;{val}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mb-6">
                <button
                  onClick={handleCustom}
                  className={`w-full text-left text-sm font-medium mb-2 ${
                    isCustom ? 'text-accent-600' : 'text-gray-500'
                  }`}
                >
                  Custom amount
                </button>
                {isCustom && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="relative"
                  >
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                      &pound;
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent"
                      autoFocus
                    />
                  </motion.div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={effectiveAmount < 1}
                className="w-full"
                variant="secondary"
              >
                Donate &pound;
                {effectiveAmount > 0 ? effectiveAmount.toFixed(2) : '0.00'}
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
