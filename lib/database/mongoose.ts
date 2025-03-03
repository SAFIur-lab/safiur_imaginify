import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("Missing MONGODB_URL environment variable.");
}

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Use `let` instead of `var` to comply with ESLint rules
declare global {
  namespace globalThis {
    var mongoose: MongooseConnection | undefined;
  }
}

// Ensure a single global cached connection instance
let cached: MongooseConnection = globalThis.mongoose ?? { conn: null, promise: null };
globalThis.mongoose = cached; // Assign the cached instance to globalThis

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: "imaginify",
      bufferCommands: false,
    });

  cached.conn = await cached.promise;
  return cached.conn;
};