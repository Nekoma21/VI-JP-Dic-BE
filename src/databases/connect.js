import mongooese from 'mongoose';

const connectDB = async () => {
    try {
        await mongooese.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        const db = mongooese.connection.useDb('sample_mflix');
        const collection = db.collection('comments');
        const data = await collection.find({}).limit(10).toArray();

        console.log('Sample Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB;