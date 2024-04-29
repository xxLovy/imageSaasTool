import mongoose, { Mongoose } from 'mongoose'

const MONGODB_URL = process.env.MONGODB_URL


export const connectToDatabase = async () => {
    if (!MONGODB_URL) {
        throw new Error('Missing MongoDB URL');
    }

    // 每次调用都尝试创建新的连接
    const conn = await mongoose.connect(MONGODB_URL, {
        dbName: "IMAGINARY-XX", // 确保数据库名称与实际的数据库匹配
        bufferCommands: false,
    });

    return conn;
};

// interface MongooseConnection {
//     conn: Mongoose | null;
//     promise: Promise<Mongoose> | null;
// }

// // caching connection?? because the serverless Next.js
// let cached: MongooseConnection = (global as any).mongoose

// if (!cached) {
//     cached = (global as any).mongoose = {
//         conn: null, promise: null
//     }
// }

// export const connectToDatabase = async () => {
//     if (cached.conn) return cached.conn;

//     if (!MONGODB_URL) throw new Error('Missing MongoDB URL')

//     cached.promise = cached.promise || mongoose.connect(MONGODB_URL, {
//         dbName: "IMAGINARY-XX",
//         bufferCommands: false,
//     })

//     cached.conn = await cached.promise
//     return cached.conn
// }