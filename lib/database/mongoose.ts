import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("Missing MONGODB_URL environment variable.");
}

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Global type declaration (using var for TypeScript merging)
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined;
}

// Use const for never-reassigned variable
const cached: MongooseConnection = globalThis.mongoose ?? {
  conn: null,
  promise: null,
};

// Assign to globalThis once
globalThis.mongoose = cached;

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: "Safiur_imaginify",
      bufferCommands: false,
    });

  cached.conn = await cached.promise;
  return cached.conn;
};