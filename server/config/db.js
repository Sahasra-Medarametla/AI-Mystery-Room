import mongoose from 'mongoose';

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to start the case server.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.info('MongoDB connected.');
}
