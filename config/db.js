import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URL).then(() => console.log("MongoDB Connected"));
}


export default connectDB;
