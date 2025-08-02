import mongoose from "mongoose";

let isConnected = false; // Track connection state globally

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ MongoDB already connected");
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined in environment variables.");
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });

    isConnected = !!db.connections[0].readyState; // 1 means connected
    console.log("✅ MongoDB Connected:", db.connection.host);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

export default connectDB;
