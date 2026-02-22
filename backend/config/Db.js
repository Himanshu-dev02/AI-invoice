import mongoose, { mongo } from "mongoose";

export const connectDB = async () => {
  await mongoose.connect('mongodb+srv://meshramhimanshu20_db_user:invoice999@cluster0.olok7oo.mongodb.net/InvoiceAI')
    .then(() => { console.log('MongoDB connected')});
}