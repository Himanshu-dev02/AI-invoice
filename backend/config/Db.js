import mongoose, { mongo } from "mongoose";

export const connectDB = async () => {
  await mongoose.connect('Your mongo db key')
    .then(() => { console.log('MongoDB connected')});
}
