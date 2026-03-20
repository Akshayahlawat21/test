require('dotenv/config');
const mongoose = require('mongoose');
const Charity = require('./models/Charity');

const charities = [
  {
    name: 'First Tee',
    slug: 'first-tee',
    description: 'Building game changers by empowering young people through golf.',
    featured: true,
    active: true,
  },
  {
    name: 'Folds of Honor',
    slug: 'folds-of-honor',
    description: 'Providing educational scholarships to families of fallen and disabled service members.',
    featured: true,
    active: true,
  },
  {
    name: 'St. Jude Children\'s Research Hospital',
    slug: 'st-jude',
    description: 'Leading the way the world understands, treats and defeats childhood cancer.',
    featured: true,
    active: true,
  },
  {
    name: 'Wounded Warrior Project',
    slug: 'wounded-warrior-project',
    description: 'Honoring and empowering wounded warriors who incurred service-connected injuries.',
    featured: false,
    active: true,
  },
  {
    name: 'Habitat for Humanity',
    slug: 'habitat-for-humanity',
    description: 'Helping families build and improve places to call home.',
    featured: false,
    active: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const count = await Charity.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} charities. Skipping seed.`);
    } else {
      await Charity.insertMany(charities);
      console.log(`Seeded ${charities.length} charities successfully!`);
    }

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
