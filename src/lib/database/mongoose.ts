import mongoose, { Mongoose } from 'mongoose'

const MONGODB_URL = process.env.MONGODB_URL

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// caching connection?? because the serverless Next.js
let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null, promise: null
    }
}

export const connectToDatabase = async () => {
    if (cached.conn) {
        console.log("there is cached connection")
        return cached.conn;
    }
    console.log("no cached connection, creating connection")

    if (!MONGODB_URL) throw new Error('Missing MongoDB URL')

    cached.promise = cached.promise || mongoose.connect(MONGODB_URL, {
        dbName: "IMAGINARY-XX",
        bufferCommands: false,
    })

    cached.conn = await cached.promise
    return cached.conn
}