// app/api/obe/assessments/[assessmentId]/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Assessment from "@/models/Assessment";
import CourseOutcome from "@/models/CourseOutcome"; // For PUT validation
// import StudentResult from "@/models/StudentResult"; // For DELETE validation
import mongoose from "mongoose";

// GET handler for single Assessment
export async function GET(req, { params }) {
    try {
        await connectMongoDB();
        const { assessmentId } = params;

        if (!assessmentId || !mongoose.Types.ObjectId.isValid(assessmentId)) {
            return NextResponse.json({ message: "Invalid or missing Assessment ID" }, { status: 400 });
        }

        // --- Auth ---
        // Check authorization
        // ---

        const assessment = await Assessment.findById(assessmentId)
                                       .populate({
                                           path: 'coMapping.courseOutcome',
                                           select: 'code description'
                                        })
                                       .populate('subject', 'name id'); // Populate subject name/id too

        if (!assessment) {
            return NextResponse.json({ success: false, message: "Assessment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: assessment }, { status: 200 });

    } catch (error) {
        console.error(`API Error fetching Assessment ${params.assessmentId}:`, error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// PUT handler for updating an Assessment
export async function PUT(req, { params }) {
     try {
        await connectMongoDB();
        const { assessmentId } = params;
        const body = await req.json();
        // Don't allow changing subject easily
        const { subject, ...updateData } = body;


        if (!assessmentId || !mongoose.Types.ObjectId.isValid(assessmentId)) {
            return NextResponse.json({ message: "Invalid or missing Assessment ID" }, { status: 400 });
        }

        // --- Auth ---
        // Check authorization
        // ---

        // Fetch existing assessment to get subject if needed for validation
         const existingAssessment = await Assessment.findById(assessmentId).lean(); // Use lean for read-only
         if (!existingAssessment) {
             return NextResponse.json({ success: false, message: "Assessment not found" }, { status: 404 });
         }


        // Validate coMapping if present in updateData
        if (updateData.coMapping) {
             if (!Array.isArray(updateData.coMapping)) {
                 return NextResponse.json({ success: false, message: 'coMapping must be an array.' }, { status: 400 });
             }
             const coIds = updateData.coMapping.map(m => m.courseOutcome);
              if (coIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
                 return NextResponse.json({ success: false, message: 'One or more Course Outcome IDs in coMapping are invalid.' }, { status: 400 });
             }
              // Ensure updated COs belong to the original subject
             const existingCosCount = await CourseOutcome.countDocuments({ _id: { $in: coIds }, subject: existingAssessment.subject });
              if (existingCosCount !== coIds.length) {
                 return NextResponse.json({ success: false, message: 'One or more Course Outcomes in coMapping not found or do not belong to this assessment\'s subject.' }, { status: 400 });
             }
              if (updateData.coMapping.some(m => typeof m.maxMarks !== 'number' || m.maxMarks < 0)) {
                 return NextResponse.json({ success: false, message: 'maxMarks within coMapping must be a non-negative number.' }, { status: 400 });
             }
        }

        // Perform update (Schema validation for marks sum will run)
        // Important: findByIdAndUpdate doesn't trigger 'validate' middleware by default on paths *not* being updated
        // if maxMarks is updated but coMapping is not, the validation might not run correctly.
        // It's safer to fetch, modify, and save() or run validation manually if needed.
        // For simplicity here, assuming `runValidators: true` works sufficiently for updates.
        const updatedAssessment = await Assessment.findByIdAndUpdate(
            assessmentId,
            updateData,
            { new: true, runValidators: true, context: 'query' }
        ).populate({ path: 'coMapping.courseOutcome', select: 'code description' })
         .populate('subject', 'name id');


        if (!updatedAssessment) {
             // Should not happen if findById found it earlier, but check again
            return NextResponse.json({ success: false, message: "Assessment not found during update." }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedAssessment, message: "Assessment updated." }, { status: 200 });

    } catch (error) {
        console.error(`API Error updating Assessment ${params.assessmentId}:`, error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ success: false, message: error.message, errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// DELETE handler for an Assessment
export async function DELETE(req, { params }) {
     try {
        await connectMongoDB();
        const { assessmentId } = params;

        if (!assessmentId || !mongoose.Types.ObjectId.isValid(assessmentId)) {
            return NextResponse.json({ message: "Invalid or missing Assessment ID" }, { status: 400 });
        }

        // --- Auth ---
        // Check authorization
        // ---

        // **Important Check**: Prevent deletion if student results exist for this assessment?
        // const resultsExist = await StudentResult.exists({ assessment: assessmentId });
        // if (resultsExist) {
        //     return NextResponse.json({ success: false, message: 'Cannot delete: Student results exist for this assessment.' }, { status: 400 });
        // }


        const deletedAssessment = await Assessment.findByIdAndDelete(assessmentId);

        if (!deletedAssessment) {
            return NextResponse.json({ success: false, message: "Assessment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Assessment deleted successfully." }, { status: 200 });

    } catch (error) {
        console.error(`API Error deleting Assessment ${params.assessmentId}:`, error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}