import mongoose, { Connection, Model, Document } from 'mongoose';

interface ISearchHistory extends Document {
    userId: string;
    searchData: any;
    searchDate: Date;
    totalResults: number;
}

let cached: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
} = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null
    };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
    if (cached.conn) {
        const connection = cached.conn.connection;
        if (connection?.db) {
            console.log('[MongoDB] Using existing connection to database:', connection.db.databaseName);
        }
        return cached.conn;
    }

    if (!process.env.NEXT_PUBLIC_MONGODB_URI) {
        throw new Error('Please define the NEXT_PUBLIC_MONGODB_URI environment variable inside .env');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('[MongoDB] New connection established');
                return mongoose;
            })
            .catch((error) => {
                console.error('[MongoDB] Connection error:', error);
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
        const connection: Connection = cached.conn.connection;
        
        if (connection.db) {
            const collections = await connection.db.listCollections().toArray();
            console.log('[MongoDB] Available collections:', collections.map(c => c.name));
        }

        return cached.conn;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
}

const SearchHistorySchema = new mongoose.Schema<ISearchHistory>({
    userId: { 
        type: String, 
        required: true, 
        index: true 
    },
    searchData: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    },
    searchDate: { 
        type: Date, 
        default: Date.now 
    },
    totalResults: { 
        type: Number, 
        required: true 
    }
}, { 
    timestamps: true 
});

SearchHistorySchema.index({ userId: 1, searchDate: -1 });

export const SearchHistory: Model<ISearchHistory> = 
    mongoose.models.SearchHistory || 
    mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);

export async function disconnectFromDatabase(): Promise<void> {
    try {
        if (cached.conn) {
            await cached.conn.disconnect();
            cached.conn = null;
            cached.promise = null;
            console.log('[MongoDB] Disconnected successfully');
        }
    } catch (error) {
        console.error('[MongoDB] Error during disconnect:', error);
        throw error;
    }
}

export async function checkConnection(): Promise<boolean> {
    try {
        if (!cached.conn) {
            return false;
        }
        const connection = cached.conn.connection;
        return connection.readyState === 1;
    } catch (error) {
        console.error('[MongoDB] Error checking connection:', error);
        return false;
    }
}