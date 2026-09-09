import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const seedCategories = async () => {
    // Dynamically import to avoid circular deps
    const { default: Category } = await import('../models/Category.js');

    const defaultCategories = [
        { name: 'Books & Notes', description: 'Textbooks, notes, and study materials' },
        { name: 'Electronics', description: 'Laptops, phones, gadgets, and accessories' },
        { name: 'Clothing', description: 'Clothes, shoes, and accessories' },
        { name: 'Furniture', description: 'Chairs, tables, and room furnishings' },
        { name: 'Sports & Fitness', description: 'Sports equipment and fitness gear' },
        { name: 'Hostel Essentials', description: 'Kitchen, bedding, and hostel items' },
        { name: 'Stationery', description: 'Pens, notebooks, and office supplies' },
        { name: 'Others', description: 'Miscellaneous items' },
    ];

    const count = await Category.countDocuments();
    if (count === 0) {
        await Category.insertMany(defaultCategories);
        console.log('✅ Default categories seeded.');
    }
};

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI;
        let connection;

        if (mongoUri) {
            try {
                connection = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            } catch (error) {
                console.warn(`Configured MongoDB unavailable: ${error.message}`);
                await mongoose.disconnect();
                mongoUri = null;
            }
        }

        if (!mongoUri) {
            const mongoServer = await MongoMemoryServer.create();
            mongoUri = mongoServer.getUri();
            connection = await mongoose.connect(mongoUri);
        }
        console.log(`MongoDB Connected: ${connection.connection.host}`);
        await seedCategories();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
