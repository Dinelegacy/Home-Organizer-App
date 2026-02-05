const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);


async function connectDB() {
    try {
        await client.connect();
        console.log("Database is connected");
        return client.db("homeOrganizer");
    }
    catch (error) {
        console.error("Database connection failed", error);
        process.exit(1); // stop server running if database connection fails

    }



};

module.exports = connectDB;  // Export the connectDB function
