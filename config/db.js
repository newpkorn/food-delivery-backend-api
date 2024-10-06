import mongoose from "mongoose";
import env from 'dotenv';

env.config();

const connectDB = async () => {
  await mongoose.connect(process.env.VITE_MONGO_URI).then(() => console.log("MongoDB Connected"));
}

export default connectDB;