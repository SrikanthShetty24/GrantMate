/**
 * Seed script: creates the initial admin user.
 * Usage: node scripts/seedAdmin.js
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grantmate');
  console.log('Connected to MongoDB');

  // Dynamically load model
  const userSchema = new mongoose.Schema({
    name: String, email: String, passwordHash: String,
    role: String, isActive: Boolean, lastLogin: Date,
  }, { timestamps: true });
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const email = process.env.ADMIN_EMAIL || 'admin@grantmate.in';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const name = 'GrantMate Admin';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, role: 'admin', isActive: true });
  console.log(`✅ Admin created: ${email} / ${password}`);
  console.log('⚠️  Change the password immediately after first login!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
