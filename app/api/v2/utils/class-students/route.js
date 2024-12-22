import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/connectDb';
import Student from '@/models/student';

export async function GET(req) {
    try {
        await connectMongoDB();

        const { searchParams } = new URL(req.url);
        const classId = searchParams.get('classId');
        const department = searchParams.get('department');
        const academicYear = searchParams.get('academicYear');

        let query = {};

        if (classId) {
            query.class = classId;
        }

        if (department) {
            query.department = department;
        }

        if (academicYear) {
            query.year = academicYear;
        }
        console.log(query);

        const students = await Student.find(query).select('_id rollNumber name email department year');
        console.log(students);

        return NextResponse.json(students, { status: 200 });
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

