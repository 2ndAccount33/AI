// Migration script to add activity tracking fields to existing users
// Run with: npx tsx src/scripts/migrate-activity-fields.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-platform';

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }

        const result = await db.collection('users').updateMany(
            { activityLog: { $exists: false } },
            {
                $set: {
                    activityLog: [],
                    streakData: {
                        current: 0,
                        longest: 0,
                        lastActivityDate: null,
                    },
                    studyTime: {
                        total: 0,
                        thisWeek: 0,
                        sessions: [],
                    },
                    skillsProgress: [],
                    questsCompleted: 0,
                    activeQuests: [],
                },
            }
        );

        console.log(`Migration complete: ${result.modifiedCount} users updated`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrate();
