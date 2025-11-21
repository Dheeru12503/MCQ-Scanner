import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import MCQ from '@/models/MCQ';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // TEMPORARILY DISABLED FOR TESTING
        const userId = getUserIdFromRequest(request) || 'test-user-id';
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const examId = searchParams.get('id');

        if (examId) {
            const exam = await Exam.findById(examId);
            // TEMPORARILY DISABLED USER CHECK FOR TESTING
            if (!exam || (userId !== 'test-user-id' && exam.userId !== userId)) {
                return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
            }

            return NextResponse.json({ exam });
        }

        const exams = await Exam.find(userId === 'test-user-id' ? {} : { userId })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ exams });
    } catch (error: any) {
        console.error('Error fetching exams:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch exams' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // TEMPORARILY DISABLED FOR TESTING
        const userId = getUserIdFromRequest(request) || 'test-user-id';
        // if (!userId) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const { subject, topic, questionCount, timeLimit, includeAttempted } = await request.json();

        await connectDB();

        const query: any = {};
        if (subject) query.subject = subject;
        if (topic) query.topic = topic;

        // Get available MCQs
        let mcqs = await MCQ.find(query);

        // If not including attempted questions, filter them out
        // (This is a simplified version - you might want to track attempted questions per user)

        if (mcqs.length === 0) {
            return NextResponse.json(
                { error: 'No MCQs available for the selected criteria' },
                { status: 400 }
            );
        }

        // Shuffle and select random questions
        const shuffled = mcqs.sort(() => 0.5 - Math.random());
        const selectedMCQs = shuffled.slice(0, Math.min(questionCount || 10, shuffled.length));

        const exam = await Exam.create({
            userId,
            questions: selectedMCQs.map((q: any) => q._id.toString()),
            subject,
            topic,
            duration: timeLimit || 60,
            timeLimit: timeLimit || 60,
            totalQuestions: selectedMCQs.length,
            answers: {},
        });

        return NextResponse.json(
            { message: 'Exam created successfully', exam, questions: selectedMCQs },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating exam:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create exam' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // TEMPORARILY DISABLED FOR TESTING
        const userId = getUserIdFromRequest(request) || 'test-user-id';
        // if (!userId) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const { examId, answers, completed } = await request.json();

        await connectDB();

        const exam = await Exam.findById(examId);
        // TEMPORARILY DISABLED USER CHECK FOR TESTING
        if (!exam || (userId !== 'test-user-id' && exam.userId !== userId)) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        if (answers) {
            exam.answers = answers;
        }

        if (completed) {
            exam.completedAt = new Date();

            // Calculate score
            const questionIds = exam.questions;
            const mcqs = await MCQ.find({ _id: { $in: questionIds } });

            let correct = 0;
            let wrong = 0;
            let unanswered = 0;

            mcqs.forEach((mcq: any) => {
                const mcqId = mcq._id.toString();
                const userAnswer = exam.answers?.[mcqId];

                if (userAnswer === undefined || userAnswer === null) {
                    unanswered++;
                } else if (userAnswer === mcq.correctAnswer) {
                    correct++;
                } else {
                    wrong++;
                }
            });

            exam.correctAnswers = correct;
            exam.wrongAnswers = wrong;
            exam.unanswered = unanswered;
            exam.score = (correct / exam.totalQuestions) * 100;
        }

        await exam.save();

        return NextResponse.json({ message: 'Exam updated successfully', exam });
    } catch (error: any) {
        console.error('Error updating exam:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update exam' },
            { status: 500 }
        );
    }
}
