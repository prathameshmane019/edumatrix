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
            // When classId is provided, only filter by classId and optional department
            query['academicDetails.class'] = classId;
            
            if (department) {
                query['academicDetails.department'] = department;
            }
        } else {
            // When no classId is provided, use department and academicYear filters if available
            if (department) {
                query['academicDetails.department'] = department;
            }

            if (academicYear) {
                query['academicDetails.academicYear'] = academicYear;
            }
        }
        
        console.log("Query:", query);

        const students = await Student.find(query).lean().exec();
        
        // Map the nested structure to the expected flat structure
        const formattedStudents = students.map(student => ({
            _id: student._id,
            rollNumber: student.academicDetails.rollNumber,
            name: student.personalDetails.name,
            email: student.personalDetails.email,
            department: student.academicDetails.department,
            year: student.academicDetails.academicYear
        }));
        
        console.log("Results:", formattedStudents.length);

        return NextResponse.json(formattedStudents, { status: 200 });
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}