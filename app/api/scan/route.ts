import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';

// Python service URL (configurable via environment variable)
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
    try {
        // TEMPORARILY DISABLED FOR TESTING
        const userId = getUserIdFromRequest(request) || 'test-user-id';
        // if (!userId) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Convert file to FormData for Python service
        const pythonFormData = new FormData();
        const fileBuffer = await file.arrayBuffer();
        const blob = new Blob([fileBuffer], { type: file.type });
        pythonFormData.append('image', blob, file.name);

        // Call Python OCR service
        const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/scan`, {
            method: 'POST',
            body: pythonFormData,
        });

        if (!pythonResponse.ok) {
            const errorData = await pythonResponse.json().catch(() => ({}));
            return NextResponse.json(
                {
                    error: errorData.error || 'Python OCR service failed',
                    details: errorData
                },
                { status: pythonResponse.status }
            );
        }

        const data = await pythonResponse.json();

        // Validate response
        if (!data.mcqs || !Array.isArray(data.mcqs)) {
            return NextResponse.json({
                message: data.message || 'No MCQs extracted',
                mcqs: [],
                extracted_text: data.extracted_text || '',
            });
        }

        // Validate and normalize MCQs
        const validatedMCQs = data.mcqs.map((mcq: any) => ({
            question: mcq.question || '',
            options: Array.isArray(mcq.options) ? mcq.options.filter((opt: string) => opt.trim()) : [],
            correctAnswer: typeof mcq.correctAnswer === 'number' ? mcq.correctAnswer : 0,
            subject: mcq.subject || '',
            topic: mcq.topic || '',
        })).filter((mcq: any) => mcq.question && mcq.options.length >= 2); // Filter out invalid MCQs

        return NextResponse.json({
            message: data.message || `Successfully extracted ${validatedMCQs.length} MCQ(s)`,
            mcqs: validatedMCQs,
            extracted_text: data.extracted_text, // Include for debugging
        });
    } catch (error: any) {
        console.error('Scan error:', error);

        // Check if Python service is running
        if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
            return NextResponse.json(
                {
                    error: 'Python OCR service is not running. Please start it on port 5000.',
                    details: 'Run: cd python-mcq-scanner && python app.py'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to scan image' },
            { status: 500 }
        );
    }
}
