import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    profile: {
        name: string;
        currentRole: string;
        targetRole: string;
        avatar?: string;
    };
    xp: number;
    level: number;
    badges: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        earnedAt: Date;
    }>;
    completedModules: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        profile: {
            name: { type: String, required: true },
            currentRole: { type: String, default: '' },
            targetRole: { type: String, default: '' },
            avatar: { type: String },
        },
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: [
            {
                id: String,
                name: String,
                description: String,
                icon: String,
                earnedAt: { type: Date, default: Date.now },
            },
        ],
        completedModules: [{ type: Schema.Types.ObjectId, ref: 'Assessment' }],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on XP
userSchema.pre('save', function (next) {
    this.level = Math.floor(this.xp / 1000) + 1;
    next();
});

export const User = mongoose.model<IUser>('User', userSchema);
