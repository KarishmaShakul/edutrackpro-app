import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/index.js';

await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({ email: 'admin@edutrack.com' });
if (existing) {
  console.log('Admin already exists');
  process.exit(0);
}

await User.create({
  name:     'Super Admin',
  email:    'admin@edutrack.com',
  password: 'Admin@123',
  role:     'admin',
});

console.log('✅ Admin seeded: admin@edutrack.com / Admin@123');
await mongoose.disconnect();
process.exit(0);