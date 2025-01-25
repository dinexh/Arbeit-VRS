import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const URL = process.env.MONGO_URL;

let client = null;
let isConnecting = false;
let connectionPromise = null;

if(!URL){
    console.log('Environment variables MONGO_URL or MONGO_DB are not set');
    process.exit(1);
}

export async function connect() {
    try {
        // If already connected, return the existing connection
        if (client?.topology?.isConnected()) {
            return client.db();
        }

        // If a connection attempt is in progress, wait for it
        if (isConnecting && connectionPromise) {
            await connectionPromise;
            return client.db();
        }

        // Start a new connection
        isConnecting = true;
        connectionPromise = new Promise(async (resolve, reject) => {
            try {
                client = new MongoClient(URL, {
                    maxPoolSize: 10,
                    minPoolSize: 5,
                    retryWrites: true,
                    w: 'majority',
                    connectTimeoutMS: 30000,
                    socketTimeoutMS: 45000
                });
                await client.connect();
                console.log("Connected to MongoDB");
                resolve();
            } catch (err) {
                console.error("MongoDB connection error:", err);
                client = null;
                reject(err);
            } finally {
                isConnecting = false;
                connectionPromise = null;
            }
        });

        await connectionPromise;
        return client.db();
    } catch(err) {
        console.error("Error in connect function:", err);
        throw err;
    }
}

export async function disconnect() {
    try {
        if (client?.topology?.isConnected()) {
            await client.close(true); // Force close
            client = null;
            console.log("Disconnected from MongoDB");
        }
    } catch(err) {    
        console.error("Error in disconnect function:", err);
        // Don't throw the error, just log it
        // This prevents disconnect errors from breaking the response
    }
}

