// app/api/obe/course-outcomes/route.js
// ... (Paste the complete code for this file from the previous response) ...
import { NextResponse } from "next/server";
import { connectMongoDB } from '@/lib/connectDb'; // Adjust path as needed
import CourseOutcome from '@/models/CourseOutcome';
import Subject from "@/models/subject";
import ProgramOutcome from '@/models/ProgramOutcome';
import mongoose from 'mongoose';
// import { authenticate, authorize } from '@/lib/auth'; // Your auth middleware

// GET Handler
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get('subjectId');
        if (!subjectId) {
            return NextResponse.json({ success: false, message: 'Subject ID is required' }, { status: 400 });
        }
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
           return NextResponse.json({ success: false, message: 'Invalid Subject ID format' }, { status: 400 });
        }

        // --- Auth ---
        // Check if user can view COs for this subject
        // ---

        const courseOutcomes = await CourseOutcome.find({ subject: subjectId })
                                       .populate({ // Populate PO details
                                           path: 'poMapping.programOutcome',
                                           select: 'code description' // Select needed fields
                                        })
                                       .sort({ code: 1 });

        return NextResponse.json({ success: true, data: courseOutcomes }, { status: 200 });
    } catch (error) {
        console.error("API Error fetching course outcomes:", error);
        return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

// POST Handler
export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { code, description, subject, cognitiveLevel, poMapping } = body;

         // --- Auth ---
        // Check if user (faculty/admin) can create COs for this subject
        // ---

        if (!code || !description || !subject || !poMapping || !Array.isArray(poMapping) || poMapping.length === 0) {
             return NextResponse.json({ success: false, message: 'Missing required fields: code, description, subject, poMapping (must be non-empty array).' }, { status: 400 });
        }
         if (!mongoose.Types.ObjectId.isValid(subject)) {
             return NextResponse.json({ message: "Invalid Subject ID format" }, { status: 400 });
         }

         const subjectExists = await Subject.findById(subject);
         if (!subjectExists) {
            return NextResponse.json({ success: false, message: `Subject with ID ${subject} not found.` }, { status: 400 });
         }

        const poIds = poMapping.map(p => p.programOutcome);
        // Validate PO ObjectIds
         if (poIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
             return NextResponse.json({ success: false, message: 'One or more Program Outcome IDs in poMapping are invalid.' }, { status: 400 });
         }
        const existingPosCount = await ProgramOutcome.countDocuments({ _id: { $in: poIds } });
        if (existingPosCount !== poIds.length) {
             return NextResponse.json({ success: false, message: 'One or more Program Outcomes in poMapping not found.' }, { status: 400 });
        }

        const existingCO = await CourseOutcome.findOne({ code, subject });
        if (existingCO) {
            return NextResponse.json({ success: false, message: `Course Outcome code '${code}' already exists for this subject.` }, { status: 409 }); // Conflict
        }

        const newCourseOutcome = new CourseOutcome(body);
        await newCourseOutcome.save();
        // Populate the saved outcome before sending back (optional, but good for immediate display)
        await newCourseOutcome.populate({ path: 'poMapping.programOutcome', select: 'code description' });


        return NextResponse.json({ success: true, data: newCourseOutcome, message: "Course Outcome created." }, { status: 201 });
    } catch (error) {
        console.error("API Error creating course outcome:", error);
         if (error.name === 'ValidationError') {
            return NextResponse.json({ success: false, message: 'Validation Error', errors: error.errors }, { status: 400 });
         }
        return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}