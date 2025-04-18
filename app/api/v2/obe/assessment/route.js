// app/api/obe/assessments/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Assessment from "@/models/Assessment";
import Subject from "@/models/subject";
import CourseOutcome from "@/models/CourseOutcome";
import mongoose from "mongoose";

// GET handler to fetch assessments by subject
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get('subjectId');
        const academicYear = searchParams.get('academicYear');
        const sem = searchParams.get('sem');

        if (!subjectId) {
            return NextResponse.json({ success: false, message: 'Subject ID is required' }, { status: 400 });
        }
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return NextResponse.json({ success: false, message: 'Invalid Subject ID format' }, { status: 400 });
        }

        // --- Auth ---
        // Check user authorization
        // ---

        let query = { subject: subjectId };
        if (academicYear) query.academicYear = academicYear;
        if (sem) query.sem = sem;

        const assessments = await Assessment.find(query)
                                    .populate({ // Populate CO details within the mapping
                                        path: 'coMapping.courseOutcome',
                                        select: 'code description'
                                    })
                                    .sort({ assessmentDate: 1, name: 1 }); // Sort by date, then name

        return NextResponse.json({ success: true, data: assessments }, { status: 200 });

    } catch (error) {
        console.error("API Error fetching assessments:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// POST handler to create a new assessment
export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { name, type, subject, academicYear, sem, maxMarks, assessmentDate, coMapping } = body;

        // --- Auth ---
        // Check user authorization (faculty/admin for this subject)
        // ---

        // Basic Validation
        if (!name || !type || !subject || !academicYear || !sem || maxMarks === undefined || !coMapping) {
             return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
        }
         if (!mongoose.Types.ObjectId.isValid(subject)) {
             return NextResponse.json({ message: "Invalid Subject ID format" }, { status: 400 });
         }
        if (typeof maxMarks !== 'number' || maxMarks < 0) {
             return NextResponse.json({ success: false, message: 'maxMarks must be a non-negative number.' }, { status: 400 });
        }
        if (!Array.isArray(coMapping)) {
             return NextResponse.json({ success: false, message: 'coMapping must be an array.' }, { status: 400 });
        }

        // Validate Subject Exists
         const subjectExists = await Subject.findById(subject);
         if (!subjectExists) {
            return NextResponse.json({ success: false, message: `Subject with ID ${subject} not found.` }, { status: 400 });
         }
         // Ensure academicYear and sem match the subject's context if needed (or trust input)

         // Validate CO Mapping structure and existence of COs
         const coIds = coMapping.map(m => m.courseOutcome);
         if (coIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
             return NextResponse.json({ success: false, message: 'One or more Course Outcome IDs in coMapping are invalid.' }, { status: 400 });
         }
         const existingCosCount = await CourseOutcome.countDocuments({ _id: { $in: coIds }, subject: subject }); // Ensure COs belong to the same subject
         if (existingCosCount !== coIds.length) {
             return NextResponse.json({ success: false, message: 'One or more Course Outcomes in coMapping not found or do not belong to this subject.' }, { status: 400 });
         }
          if (coMapping.some(m => typeof m.maxMarks !== 'number' || m.maxMarks < 0)) {
             return NextResponse.json({ success: false, message: 'maxMarks within coMapping must be a non-negative number for all items.' }, { status: 400 });
         }


        // Create and Save (Validation for sum of coMapping marks vs maxMarks happens in Schema pre-save)
        const newAssessment = new Assessment({
             name, type, subject, academicYear, sem, maxMarks, assessmentDate, coMapping
         });
        await newAssessment.save(); // This will trigger the schema validation

        // Populate after saving for response
         await newAssessment.populate({ path: 'coMapping.courseOutcome', select: 'code description' });

        return NextResponse.json({ success: true, data: newAssessment, message: "Assessment created." }, { status: 201 });

    } catch (error) {
        console.error("API Error creating assessment:", error);
        if (error.name === 'ValidationError') {
             // Mongoose validation errors (including the custom one for marks sum)
            return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}