/**
 * Database Seed Script
 *
 * Creates sample data for development and testing.
 * Run with: node src/scripts/seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env config
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const env = require('../config/env');

// Models
const User = require('../models/User');
const Charity = require('../models/Charity');
const Draw = require('../models/Draw');
const Transaction = require('../models/Transaction');

/* ─── Seed Data ─── */

const charities = [
  {
    name: 'Hearts for Heroes Foundation',
    slug: 'hearts-for-heroes-foundation',
    description: 'Supporting military veterans and their families with mental health services, housing assistance, and career transition programmes. We believe every hero deserves a safe landing.',
    featured: true,
    active: true,
    totalReceived: 14200,
    images: [{ url: 'https://placehold.co/600x400/f97316/fff?text=Hearts+for+Heroes', alt: 'Hearts for Heroes Foundation' }],
    events: [
      { title: 'Charity Golf Day', description: 'Annual fundraising tournament', date: new Date('2026-06-15'), location: 'Royal Birkdale' },
    ],
  },
  {
    name: 'Green Future Initiative',
    slug: 'green-future-initiative',
    description: 'Planting trees, restoring wetlands, and educating communities about sustainable living. Our mission is to leave the planet greener than we found it.',
    featured: false,
    active: true,
    totalReceived: 9800,
    images: [{ url: 'https://placehold.co/600x400/22c55e/fff?text=Green+Future', alt: 'Green Future Initiative' }],
    events: [],
  },
  {
    name: "Children's Hope Alliance",
    slug: 'childrens-hope-alliance',
    description: 'Providing educational resources, mentorship, and sporting opportunities for underprivileged young people across the UK. Every child deserves a chance to thrive.',
    featured: true,
    active: true,
    totalReceived: 12400,
    images: [{ url: 'https://placehold.co/600x400/3b82f6/fff?text=Childrens+Hope', alt: "Children's Hope Alliance" }],
    events: [
      { title: 'Youth Sports Day', description: 'Free sports coaching for kids', date: new Date('2026-07-20'), location: 'Birmingham' },
    ],
  },
  {
    name: 'Ocean Conservation Trust',
    slug: 'ocean-conservation-trust',
    description: 'Protecting marine ecosystems through beach clean-ups, coral restoration projects, and policy advocacy. Together we can keep our oceans healthy for future generations.',
    featured: false,
    active: true,
    totalReceived: 7600,
    images: [{ url: 'https://placehold.co/600x400/0ea5e9/fff?text=Ocean+Conservation', alt: 'Ocean Conservation Trust' }],
    events: [],
  },
  {
    name: 'Mental Health Matters UK',
    slug: 'mental-health-matters-uk',
    description: 'Breaking the stigma around mental health through community support groups, free counselling services, and workplace wellbeing programmes.',
    featured: false,
    active: true,
    totalReceived: 6000,
    images: [{ url: 'https://placehold.co/600x400/a855f7/fff?text=Mental+Health+Matters', alt: 'Mental Health Matters UK' }],
    events: [
      { title: 'Walk & Talk Event', description: 'Community walk for mental health awareness', date: new Date('2026-05-10'), location: 'London' },
    ],
  },
];

const regularUsers = [
  { name: 'James Thompson', email: 'james@example.com' },
  { name: 'Sarah Mitchell', email: 'sarah@example.com' },
  { name: 'David Roberts', email: 'david@example.com' },
  { name: 'Emma Wilson', email: 'emma@example.com' },
  { name: 'Michael Chen', email: 'michael@example.com' },
];

function randomScores() {
  const scores = [];
  for (let i = 0; i < 5; i++) {
    scores.push({
      value: Math.floor(Math.random() * 40) + 5, // 5-44
      date: new Date(2026, 1 + i, Math.floor(Math.random() * 28) + 1),
    });
  }
  return scores;
}

/* ─── Main Seed Function ─── */
async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log('[Seed] Connected successfully.');

    // Clear existing data
    console.log('[Seed] Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Charity.deleteMany({}),
      Draw.deleteMany({}),
      Transaction.deleteMany({}),
    ]);
    console.log('[Seed] Existing data cleared.');

    // Create charities
    console.log('[Seed] Creating charities...');
    const createdCharities = await Charity.insertMany(charities);
    console.log(`[Seed] Created ${createdCharities.length} charities.`);

    // Create admin user
    console.log('[Seed] Creating admin user...');
    const adminHash = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@golfcharity.com',
      passwordHash: adminHash,
      role: 'admin',
      subscription: { plan: 'none', status: 'inactive' },
    });
    console.log(`[Seed] Admin created: ${admin.email}`);

    // Create regular users
    console.log('[Seed] Creating regular users...');
    const userHash = await bcrypt.hash('password123', 12);
    const createdUsers = [];

    for (let i = 0; i < regularUsers.length; i++) {
      const u = regularUsers[i];
      const charity = createdCharities[i % createdCharities.length];
      const user = await User.create({
        name: u.name,
        email: u.email,
        passwordHash: userHash,
        role: 'user',
        subscription: {
          plan: i % 2 === 0 ? 'monthly' : 'yearly',
          status: 'active',
          currentPeriodEnd: new Date(2026, 5, 1),
          renewalDate: new Date(2026, 5, 1),
        },
        scores: randomScores(),
        charity: {
          charityId: charity._id,
          contributionPercent: 10,
        },
      });
      createdUsers.push(user);
    }
    console.log(`[Seed] Created ${createdUsers.length} regular users (password: password123).`);

    // Create a published draw
    console.log('[Seed] Creating draw...');
    const winningNumbers = [
      createdUsers[0].scores[0].value,
      createdUsers[0].scores[1].value,
      createdUsers[0].scores[2].value,
      Math.floor(Math.random() * 40) + 5,
      Math.floor(Math.random() * 40) + 5,
    ];

    const drawResults = createdUsers.map((user) => {
      const userNumbers = user.scores.map((s) => s.value);
      const matched = userNumbers.filter((n) => winningNumbers.includes(n));
      const matchCount = matched.length;
      let tier = undefined;
      let prizeAmount = 0;
      if (matchCount >= 5) { tier = '5-match'; prizeAmount = 5000; }
      else if (matchCount >= 4) { tier = '4-match'; prizeAmount = 500; }
      else if (matchCount >= 3) { tier = '3-match'; prizeAmount = 50; }

      return {
        userId: user._id,
        matchedNumbers: matched,
        matchCount,
        tier,
        prizeAmount,
        verificationStatus: prizeAmount > 0 ? 'approved' : 'pending',
        paymentStatus: prizeAmount > 0 ? 'paid' : 'pending',
      };
    });

    const draw = await Draw.create({
      month: '2026-02',
      status: 'published',
      drawType: 'random',
      winningNumbers,
      prizePool: {
        total: 2000,
        fiveMatch: 1000,
        fourMatch: 600,
        threeMatch: 400,
      },
      results: drawResults,
      publishedAt: new Date(2026, 2, 1),
      charityAllocation: 500,
    });
    console.log(`[Seed] Draw created for ${draw.month} with ${drawResults.length} participants.`);

    // Create transactions
    console.log('[Seed] Creating transactions...');
    const transactions = [];

    for (const user of createdUsers) {
      // Subscription payment
      transactions.push({
        userId: user._id,
        type: 'subscription',
        amount: user.subscription.plan === 'monthly' ? 9.99 : 99.99,
        currency: 'GBP',
        status: 'completed',
        description: `${user.subscription.plan} subscription payment`,
      });

      // Check if user won anything
      const result = drawResults.find((r) => r.userId.equals(user._id));
      if (result && result.prizeAmount > 0) {
        transactions.push({
          userId: user._id,
          type: 'prize_payout',
          amount: result.prizeAmount,
          currency: 'GBP',
          status: 'completed',
          description: `Prize payout for ${draw.month} draw (${result.tier})`,
        });
      }
    }

    // Charity donations
    for (const charity of createdCharities) {
      transactions.push({
        userId: admin._id,
        type: 'charity_donation',
        amount: 100,
        currency: 'GBP',
        status: 'completed',
        description: `Monthly donation to ${charity.name}`,
        metadata: { charityId: charity._id },
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`[Seed] Created ${transactions.length} transactions.`);

    // Summary
    console.log('\n[Seed] === Seeding Complete ===');
    console.log(`  Admin: admin@golfcharity.com / admin123`);
    console.log(`  Users: ${regularUsers.map((u) => u.email).join(', ')} / password123`);
    console.log(`  Charities: ${createdCharities.length}`);
    console.log(`  Draws: 1 (${draw.month})`);
    console.log(`  Transactions: ${transactions.length}`);
    console.log('');

  } catch (err) {
    console.error('[Seed] Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();
