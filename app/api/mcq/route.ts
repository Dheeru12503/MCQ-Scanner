import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
        const subject = searchParams.get('subject');
        const topic = searchParams.get('topic');
        const limit = searchParams.get('limit');
        const ids = searchParams.get('ids');

        const query: any = {};
        if (subject) query.subject = subject;
        if (topic) query.topic = topic;
        if (ids) {
            const idArray = ids.split(',').map(id => id.trim());
            query._id = { $in: idArray };
        }

        const mcqs = await MCQ.find(query)
            .limit(limit ? parseInt(limit) : 100)
            .sort({ createdAt: -1 });

        return NextResponse.json({ mcqs });
    } catch (error: any) {
        console.error('Error fetching MCQs:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch MCQs' },
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

        const data = await request.json();

        // Handle single MCQ or array of MCQs
        const mcqsToCreate = Array.isArray(data) ? data : [data];

        await connectDB();

        const createdMCQs = await MCQ.insertMany(
            mcqsToCreate.map((mcq: any) => ({
                ...mcq,
                createdBy: userId,
            }))
        );

        return NextResponse.json(
            { message: 'MCQ(s) created successfully', mcqs: createdMCQs },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating MCQ:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create MCQ' },
            { status: 500 }
        );
    }
}
