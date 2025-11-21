import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import MCQ from '@/models/MCQ';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // TEMPORARILY DISABLED FOR TESTING
        const userId = getUserIdFromRequest(request) || 'test-user-id';

        // Uncomment below to enable auth check
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get all exams for the user (or all exams if testing)
        const exams = await Exam.find(userId === 'test-user-id' ? {} : { userId });

        // Calculate statistics
        const totalExams = exams.length;
        const completedExams = exams.filter(e => e.completedAt).length;

        let totalCorrect = 0;
        let totalWrong = 0;
        let totalUnanswered = 0;
        let totalQuestions = 0;

        exams.forEach((exam: any) => {
            if (exam.completedAt) {
                totalCorrect += exam.correctAnswers || 0;
                totalWrong += exam.wrongAnswers || 0;
                totalUnanswered += exam.unanswered || 0;
                totalQuestions += exam.totalQuestions || 0;
            }
        });

        // Get MCQ statistics
        const totalMCQs = await MCQ.countDocuments();
        const userMCQs = await MCQ.countDocuments(
            userId === 'test-user-id' ? {} : { createdBy: userId }
        );

        // Get subjects and topics
        const subjects = await MCQ.distinct('subject');
        const topics = await MCQ.distinct('topic');

        return NextResponse.json({
            stats: {
                totalExams,
                completedExams,
                totalCorrect,
                totalWrong,
                totalUnanswered,
                totalQuestions,
                totalMCQs,
                userMCQs,
                accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
            },
            subjects,
            topics,
            recentExams: exams.slice(0, 10),
        });
    } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
