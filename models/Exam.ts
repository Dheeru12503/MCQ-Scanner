import mongoose, { Schema, Model } from 'mongoose';

export interface IExam {
    _id?: string;
    userId: string;
    questions: string[]; // Array of MCQ IDs
    subject?: string;
    topic?: string;
    startedAt: Date;
    completedAt?: Date;
    duration: number; // in minutes
    timeLimit?: number; // in minutes
    answers?: { [questionId: string]: number }; // questionId -> selected option index
    score?: number;
    totalQuestions: number;
    correctAnswers?: number;
    wrongAnswers?: number;
    unanswered?: number;
}

const ExamSchema = new Schema<IExam>(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
        },
        questions: {
            type: [String],
            required: true,
        },
        subject: {
            type: String,
            trim: true,
        },
        topic: {
            type: String,
            trim: true,
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },
        duration: {
            type: Number,
            default: 60, // 60 minutes default
        },
        timeLimit: {
            type: Number,
        },
        answers: {
            type: Schema.Types.Mixed,
            default: {},
        },
        score: {
            type: Number,
            default: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        correctAnswers: {
            type: Number,
            default: 0,
        },
        wrongAnswers: {
            type: Number,
            default: 0,
        },
        unanswered: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Exam: Model<IExam> = mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);

export default Exam;
