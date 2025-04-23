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

 
export async function PUT(req, { params }) {
     try {
         await connectMongoDB();
         const { id } = params; // Get ID from dynamic route segment
         const body = await req.json();
         const { name, type, subject, academicYear, sem, maxMarks, assessmentDate, coMapping } = body;

         if (!id || !mongoose.Types.ObjectId.isValid(id)) {
             return NextResponse.json({ message: "Invalid Assessment ID format" }, { status: 400 });
         }

         // Fetch existing assessment
         const assessmentToUpdate = await Assessment.findById(id);
         if (!assessmentToUpdate) {
             return NextResponse.json({ success: false, message: "Assessment not found." }, { status: 404 });
         }

          // --- Validation (Similar to POST) ---
          // You need to re-validate incoming fields and coMapping
          // Ensure 'subject', 'academicYear', 'sem' are not changed if they are meant to be immutable after creation
          // For this example, let's assume they might be updated, but you might restrict this.

          if (!name || !type || !subject || !academicYear || !sem || maxMarks === undefined || !Array.isArray(coMapping)) {
              console.error("Missing required fields for PUT:", body);
              return NextResponse.json({ success: false, message: 'Missing required fields (name, type, subject, academicYear, sem, maxMarks, coMapping array) in update data.' }, { status: 400 });
          }

          if (!mongoose.Types.ObjectId.isValid(subject)) {
              return NextResponse.json({ message: "Invalid Subject ID format in update data" }, { status: 400 });
          }
          if (typeof maxMarks !== 'number' || maxMarks < 0) {
              return NextResponse.json({ success: false, message: 'maxMarks in update data must be a non-negative number.' }, { status: 400 });
          }
           if (assessmentDate && isNaN(new Date(assessmentDate).getTime())) {
                return NextResponse.json({ success: false, message: 'Invalid assessmentDate format in update data.' }, { status: 400 });
           }

           const subjectExists = await Subject.findById(subject);
           if (!subjectExists) {
               return NextResponse.json({ success: false, message: `Subject with ID ${subject} in update data not found.` }, { status: 400 });
           }


          // Validate coMapping structure and content using the helper
          // Note: We pass the *potentially updated* subject ID from the body for coMapping validation
          const { isValid, errors } = await validateCoMapping(coMapping, subject, maxMarks);
          if (!isValid) {
              return NextResponse.json({ success: false, message: 'coMapping validation failed during update.', errors: errors }, { status: 400 });
          }

         // --- Update Fields ---
         assessmentToUpdate.name = name;
         assessmentToUpdate.type = type;
         assessmentToUpdate.subject = subject; // Update subject if allowed
         assessmentToUpdate.academicYear = academicYear; // Update year if allowed
         assessmentToUpdate.sem = sem; // Update sem if allowed
         assessmentToUpdate.maxMarks = maxMarks;
         assessmentToUpdate.assessmentDate = assessmentDate ? new Date(assessmentDate) : null;
         assessmentToUpdate.coMapping = coMapping.map(item => ({ // Map to schema format
              courseOutcome: new mongoose.Types.ObjectId(item.courseOutcome),
              coIndex: Number(item.coIndex),
              maxMarks: Number(item.maxMarks)
         }));

         await assessmentToUpdate.save(); // Mongoose schema validation runs here

         // Populate before returning
         await assessmentToUpdate.populate({
              path: 'coMapping.courseOutcome',
              select: 'outcomes institute department academicYear'
         });


         return NextResponse.json({ success: true, data: assessmentToUpdate, message: "Assessment updated successfully." }, { status: 200 });

     } catch (error) {
         console.error("API Error updating assessment:", error);
         if (error.name === 'ValidationError') {
              const errors = {};
              for (const field in error.errors) {
                  errors[field] = error.errors[field].message;
              }
             return NextResponse.json({ success: false, message: "Validation failed during update.", errors: errors }, { status: 400 });
         }
         return NextResponse.json({ success: false, message: "Internal Server Error during update", error: error.message }, { status: 500 });
     }
}

export async function DELETE(req, { params }) {
     try {
         await connectMongoDB();
         const { id } = params;

         if (!id || !mongoose.Types.ObjectId.isValid(id)) {
             return NextResponse.json({ message: "Invalid Assessment ID format" }, { status: 400 });
         }

         const deletedAssessment = await Assessment.findByIdAndDelete(id);

         if (!deletedAssessment) {
             return NextResponse.json({ success: false, message: "Assessment not found." }, { status: 404 });
         }

         return NextResponse.json({ success: true, message: "Assessment deleted successfully." }, { status: 200 });

     } catch (error) {
         console.error("API Error deleting assessment:", error);
         return NextResponse.json({ success: false, message: "Internal Server Error during deletion", error: error.message }, { status: 500 });
     }
}