import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  ClipboardDocumentCheckIcon,
  TrophyIcon,
  HeartIcon,
  UserGroupIcon,
  CurrencyPoundIcon,
  BuildingLibraryIcon,
  StarIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Floating Orb ─── */
function FloatingOrb({ className, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{
        y: [0, -30, 0, 30, 0],
        x: [0, 20, 0, -20, 0],
        scale: [1, 1.1, 1, 0.95, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

/* ─── Data ─── */
const steps = [
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Subscribe',
    description: 'Choose your plan and pick a charity you care about. Joining takes under two minutes.',
    gradient: 'from-orange-400 to-rose-400',
  },
  {
    icon: TrophyIcon,
    title: 'Enter Your Scores',
    description: 'Add your last 5 Stableford scores. They become your unique lottery numbers each month.',
    gradient: 'from-amber-400 to-orange-400',
  },
  {
    icon: HeartIcon,
    title: 'Win & Give',
    description: 'Match the drawn numbers to win prizes. Your chosen charity automatically receives a share.',
    gradient: 'from-rose-400 to-pink-400',
  },
];

const stats = [
  { label: 'Donated to Charity', value: 50000, prefix: '\u00a3', suffix: '+', icon: CurrencyPoundIcon },
  { label: 'Active Members', value: 2000, suffix: '+', icon: UserGroupIcon },
  { label: 'Charities Supported', value: 25, suffix: '+', icon: BuildingLibraryIcon },
];

const testimonials = [
  {
    quote: "I used to just play for fun, but knowing every round could help a charity I care about has made golf so much more meaningful.",
    name: 'James T.',
    role: 'Member since 2024',
    handicap: '14',
  },
  {
    quote: "Won \u00a3250 last month and the Ocean Conservation Trust received a donation too. The whole experience feels rewarding in a way golf apps never have.",
    name: 'Sarah M.',
    role: 'Member since 2025',
    handicap: '22',
  },
  {
    quote: "Our club signed up together. It has added a brilliant social layer to our rounds, and we have collectively raised over \u00a35,000 for local causes.",
    name: 'David R.',
    role: 'Club Captain, Riverside GC',
    handicap: '8',
  },
];

const trustBadges = [
  { icon: ShieldCheckIcon, text: 'SSL Encrypted' },
  { icon: LockClosedIcon, text: 'Stripe Secure Payments' },
  { icon: CheckBadgeIcon, text: 'Verified Charities' },
];

/* ─── Page Component ─── */
export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-rose-400 via-orange-300 to-amber-300">
        {/* Floating orbs */}
        <FloatingOrb className="w-96 h-96 bg-white/20 top-10 -left-20" delay={0} />
        <FloatingOrb className="w-72 h-72 bg-pink-300/30 bottom-10 right-10" delay={2} />
        <FloatingOrb className="w-64 h-64 bg-amber-200/25 top-1/2 left-1/3" delay={4} />
        <FloatingOrb className="w-48 h-48 bg-rose-200/20 top-20 right-1/4" delay={1} />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 relative z-10 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium tracking-wide border border-white/20">
                Charity-powered golf platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Play. Win.{' '}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-100">
                  Give Back.
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-white/20 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  style={{ originX: 0 }}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto font-light"
            >
              Turn your golf scores into lottery numbers. When you win, your favourite charity wins too.
              It is the simplest way to turn every round into real-world impact.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-base shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/15 transition-shadow duration-300 w-full sm:w-auto cursor-pointer"
                >
                  Start Your Journey
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.div>
              </Link>
              <Link to="/how-it-works">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-base backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 w-full sm:w-auto cursor-pointer"
                >
                  See How It Works
                </motion.div>
              </Link>
            </motion.div>

            {/* Social proof mini-bar */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-14 flex items-center justify-center gap-3 text-white/70 text-sm"
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white/80">
                    {['JT', 'SM', 'DR', 'AK'][i]}
                  </div>
                ))}
              </div>
              <span>Joined by <strong className="text-white">2,000+</strong> golfers</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-24 sm:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold text-rose-500 uppercase tracking-widest mb-3"
            >
              Simple as 1-2-3
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight"
            >
              How BirdieBounty Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto"
            >
              Three simple steps. Real impact. No complicated setup.
            </motion.p>
          </motion.div>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-orange-200 via-rose-200 to-pink-200" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
              className="grid md:grid-cols-3 gap-8 md:gap-12 relative"
            >
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="bg-gray-50 rounded-3xl p-8 pt-12 text-center group hover:bg-gradient-to-br hover:from-gray-50 hover:to-orange-50/50 transition-all duration-500 border border-gray-100 hover:border-orange-100 hover:shadow-xl hover:shadow-orange-100/30 relative">
                    {/* Step number badge */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center text-sm font-bold shadow-lg`}>
                        {i + 1}
                      </div>
                    </div>

                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm mb-6 group-hover:shadow-md transition-shadow">
                      <step.icon className="h-8 w-8 text-gray-700" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow between steps (desktop) */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-24 -right-8 text-orange-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14m-7-7l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ IMPACT STATS ═══════════ */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-3"
            >
              Our Impact
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
            >
              Numbers That Matter
            </motion.h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-rose-50 mb-5">
                  <stat.icon className="h-7 w-7 text-rose-500" />
                </div>
                <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                  <AnimatedCounter
                    target={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="text-sm text-gray-500 mt-2 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CHARITY SPOTLIGHT ═══════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold text-rose-500 uppercase tracking-widest mb-3"
            >
              Charity Spotlight
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
            >
              Making a Real Difference
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100">
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-rose-300 via-orange-200 to-amber-300 -z-10" />

              <div className="md:flex">
                <div className="md:w-2/5 bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center p-10 md:p-12">
                  <div className="text-center text-white">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <HeartIcon className="h-20 w-20 mx-auto mb-5 opacity-90" />
                    </motion.div>
                    <p className="text-2xl font-bold">Children's Hope Alliance</p>
                    <p className="text-rose-100 text-sm mt-2 font-medium">Featured Charity of the Month</p>
                  </div>
                </div>
                <div className="md:w-3/5 p-8 sm:p-10 md:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Every Child Deserves a Chance
                  </h3>
                  <p className="text-gray-500 leading-relaxed mb-6">
                    The Children's Hope Alliance provides educational resources, mentorship,
                    and sporting opportunities for underprivileged young people across the UK.
                    Through BirdieBounty, they have received over &pound;12,000 in donations
                    from our generous golfing community.
                  </p>
                  <div className="flex items-center gap-6 mb-6">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">&pound;12,400</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Total Raised</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">340</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Supporters</p>
                    </div>
                  </div>
                  <Link
                    to="/charities"
                    className="inline-flex items-center text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors group"
                  >
                    Explore all charities
                    <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-3"
            >
              Testimonials
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
            >
              What Our Members Say
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <StarIcon key={j} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <blockquote className="text-gray-600 leading-relaxed mb-6 flex-1 text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-orange-300 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} &middot; Handicap {t.handicap}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-24 sm:py-32 bg-gray-950 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Ready to make every
              <br />
              round count?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
              Every subscription helps fund charitable causes. Every round you play
              is a chance to win and give back.
            </p>
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold text-base shadow-xl shadow-rose-500/25 hover:shadow-2xl hover:shadow-rose-500/30 transition-shadow duration-300 cursor-pointer"
              >
                Subscribe & Start Giving
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.div>
            </Link>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2">
                  <badge.icon className="h-5 w-5 text-gray-600" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
