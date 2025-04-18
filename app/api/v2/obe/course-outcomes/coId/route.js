// app/api/obe/course-outcomes/[coId]/route.js
// ... (Paste the complete code for this file from the previous response) ...
import { NextResponse } from "next/server";
import { connectMongoDB } from '@/lib/connectDb';
import CourseOutcome from '@/models/CourseOutcome';
import ProgramOutcome from '@/models/ProgramOutcome'; // Needed for PUT validation
// import Assessment from '@/models/Assessment'; // Needed for DELETE validation
// import StudentResult from '@/models/StudentResult'; // Needed for DELETE validation
import mongoose from 'mongoose';
// import { authenticate, authorize } from '@/lib/auth';

// GET Handler
export async function GET(req, { params }) {
    try {
        await connectMongoDB();
        const { coId } = params;

        if (!coId || !mongoose.Types.ObjectId.isValid(coId)) {
            return NextResponse.json({ message: "Invalid or missing Course Outcome ID" }, { status: 400 });
        }

        // --- Auth ---
        // Verify user can view this CO
        // ---

        const courseOutcome = await CourseOutcome.findById(coId)
                                       .populate({
                                           path: 'poMapping.programOutcome',
                                           select: 'code description'
                                        });

        if (!courseOutcome) {
            return NextResponse.json({ success: false, message: 'Course Outcome not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: courseOutcome }, { status: 200 });
    } catch (error) {
        console.error(`API Error fetching CO ${params.coId}:`, error);
        return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

// PUT Handler
export async function PUT(req, { params }) {
     try {
        await connectMongoDB();
        const { coId } = params;
        const body = await req.json();
        // Don't allow changing subject or code via PUT
        const { code, subject, ...updateData } = body;


        if (!coId || !mongoose.Types.ObjectId.isValid(coId)) {
            return NextResponse.json({ message: "Invalid or missing Course Outcome ID" }, { status: 400 });
        }

         // --- Auth ---
        // Verify user can update this CO
        // ---


        // Validate poMapping if present
        if (updateData.poMapping) {
            if (!Array.isArray(updateData.poMapping) || updateData.poMapping.length === 0) {
                 return NextResponse.json({ success: false, message: 'poMapping must be a non-empty array.' }, { status: 400 });
            }
            const poIds = updateData.poMapping.map(p => p.programOutcome);
            if (poIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
                return NextResponse.json({ success: false, message: 'One or more Program Outcome IDs in poMapping are invalid.' }, { status: 400 });
            }
            const existingPosCount = await ProgramOutcome.countDocuments({ _id: { $in: poIds } });
            if (existingPosCount !== poIds.length) {
                return NextResponse.json({ success: false, message: 'One or more Program Outcomes in poMapping not found.' }, { status: 400 });
            }
        }

        const updatedOutcome = await CourseOutcome.findByIdAndUpdate(
            coId,
            updateData,
            { new: true, runValidators: true, context: 'query' }
        ).populate({ path: 'poMapping.programOutcome', select: 'code description' });

        if (!updatedOutcome) {
            return NextResponse.json({ success: false, message: 'Course Outcome not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedOutcome, message: "Course Outcome updated." }, { status: 200 });
    } catch (error) {
        console.error(`API Error updating CO ${params.coId}:`, error);
         if (error.name === 'ValidationError') {
            return NextResponse.json({ success: false, message: 'Validation Error', errors: error.errors }, { status: 400 });
         }
        return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

// DELETE Handler
export async function DELETE(req, { params }) {
    try {
        await connectMongoDB();
        const { coId } = params;

        if (!coId || !mongoose.Types.ObjectId.isValid(coId)) {
            return NextResponse.json({ message: "Invalid or missing Course Outcome ID" }, { status: 400 });
        }

         // --- Auth ---
        // Verify user can delete this CO
        // ---

        // Optional: Check dependencies (Assessments, Results) before deleting
        // const assessmentMappingExists = await Assessment.exists({ 'coMapping.courseOutcome': coId });
        // if (assessmentMappingExists) return NextResponse.json({ message: 'Cannot delete: CO mapped in assessments.' }, { status: 400 });
        // const resultMappingExists = await StudentResult.exists({ 'marksBreakdown.courseOutcome': coId });
        // if (resultMappingExists) return NextResponse.json({ message: 'Cannot delete: CO has student results.' }, { status: 400 });

        const deletedOutcome = await CourseOutcome.findByIdAndDelete(coId);

        if (!deletedOutcome) {
            return NextResponse.json({ success: false, message: 'Course Outcome not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Course Outcome deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error(`API Error deleting CO ${params.coId}:`, error);
        return NextResponse.json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}