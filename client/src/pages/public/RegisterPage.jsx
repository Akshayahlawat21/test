import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { getCharities } from '../../api/charities';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    charity: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [charityOptions, setCharityOptions] = useState([]);
  const [charityLoading, setCharityLoading] = useState(true);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch charities from API
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const { data } = await getCharities({ limit: 50 });
        setCharityOptions(
          data.charities.map((c) => ({ value: c._id, label: c.name }))
        );
      } catch {
        // Fallback to empty - form will show an error state
        setCharityOptions([]);
      } finally {
        setCharityLoading(false);
      }
    };
    fetchCharities();
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.charity) errs.charity = 'Please select a charity';
    if (!form.terms) errs.terms = 'You must accept the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        charity: form.charity,
      });
      toast.success('Account created! Welcome to BirdieBounty.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition ${
      errors[field] ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2">Start making every round count</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-5"
        >
          {apiError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {apiError}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className={inputClass('name')}
              placeholder="John Smith"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass('email')}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={inputClass('password')}
              placeholder="At least 8 characters"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={inputClass('confirmPassword')}
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="charity" className="block text-sm font-medium text-gray-700 mb-1.5">
              Choose Your Charity
            </label>
            <select
              id="charity"
              name="charity"
              value={form.charity}
              onChange={handleChange}
              className={inputClass('charity')}
              disabled={charityLoading}
            >
              <option value="">
                {charityLoading ? 'Loading charities...' : 'Select a charity...'}
              </option>
              {charityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.charity && <p className="text-xs text-red-500 mt-1">{errors.charity}</p>}
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-300 mt-0.5"
              />
              <span>
                I agree to the{' '}
                <a href="#" className="text-primary-500 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-500 hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
