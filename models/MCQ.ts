import mongoose, { Schema, Model } from 'mongoose';

export interface IMCQ {
    _id?: string;
    question: string;
    options: string[];
    correctAnswer: number;
    subject?: string;
    topic?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const MCQSchema = new Schema<IMCQ>(
    {
        question: {
            type: String,
            required: true,
        },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length >= 2 && v.length <= 6,
                message: 'Options must be between 2 and 6',
            },
        },
        correctAnswer: {
            type: Number,
            required: true,
            validate: {
                validator: function (this: IMCQ, v: number) {
                    return v >= 0 && v < this.options.length;
                },
                message: 'Correct answer must be a valid option index',
            },
        },
        subject: {
            type: String,
            trim: true,
        },
        topic: {
            type: String,
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        createdBy: {
            type: String,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const MCQ: Model<IMCQ> = mongoose.models.MCQ || mongoose.model<IMCQ>('MCQ', MCQSchema);

export default MCQ;
