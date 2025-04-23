// app/api/obe/assessments/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Assessment from "@/models/OBE/Assessment";
import Subject from "@/models/subject"; // Assuming Subject model exists and is correct
import CourseOutcome from "@/models/OBE/CourseOutcome"; // Assuming CourseOutcome model is correct and updated (with outcomes array and index)
import mongoose from "mongoose";

// Helper function to validate coMapping structure and content
async function validateCoMapping(coMapping, subjectId, totalMaxMarks) {
    const errors = [];
    const coIds = new Set();
    let totalMappedMarks = 0;

    if (!Array.isArray(coMapping)) {
        errors.push('coMapping must be an array.');
        return { isValid: false, errors };
    }

    if (coMapping.length === 0) {
         // Allow 0 mapped marks only if total max marks is also 0
         if (totalMaxMarks > 0) {
            errors.push('At least one Course Outcome must be mapped with marks greater than 0.');
         }
         // If maxMarks is 0, an empty coMapping is valid
         return { isValid: errors.length === 0, errors };
    }

    const mappedCoDetails = [];

    for (const item of coMapping) {
        if (!item || typeof item !== 'object') {
            errors.push('Each item in coMapping must be an object.');
            continue;
        }

        const { courseOutcome, coIndex, maxMarks } = item;

        // Validate courseOutcome ID
        if (!courseOutcome || !mongoose.Types.ObjectId.isValid(courseOutcome)) {
            errors.push('Invalid or missing Course Outcome ID in coMapping.');
            continue; // Cannot validate further without a valid CO ID
        }
        coIds.add(courseOutcome);

        // Validate coIndex
        if (typeof coIndex !== 'number' || !Number.isInteger(coIndex) || coIndex < 1) {
            errors.push(`Invalid or missing CO index (${coIndex}) for CO ${courseOutcome}. CO index must be a positive integer.`);
             continue; // Cannot validate further without a valid coIndex
        }

        // Validate maxMarks for the mapping item
        if (typeof maxMarks !== 'number' || maxMarks < 0) {
            errors.push(`Invalid or missing maxMarks (${maxMarks}) for CO${coIndex} mapped to ${courseOutcome}. maxMarks must be a non-negative number.`);
            continue; // Cannot validate further without valid maxMarks
        }
         totalMappedMarks += maxMarks;

        // Store valid items for the deeper check below
         mappedCoDetails.push({ coDocId: courseOutcome, coIndex: coIndex });
    }

    // Check if referenced Course Outcome documents exist and belong to the subject
    if (coIds.size > 0) {
        const existingCoDocuments = await CourseOutcome.find({ _id: { $in: Array.from(coIds) }, subject: subjectId });
        if (existingCoDocuments.length !== coIds.size) {
            errors.push('One or more referenced Course Outcome documents were not found or do not belong to this subject.');
             // If some documents are missing, stop checking indices within them
             return { isValid: false, errors };
        }

        // Check if coIndex exists within the outcomes array of the referenced CO document
        for (const mappedItem of mappedCoDetails) {
             const coDoc = existingCoDocuments.find(doc => doc._id.toString() === mappedItem.coDocId.toString());
             if (!coDoc) {
                 // This case should ideally be caught by the check above, but adding for robustness
                 errors.push(`Course Outcome document ${mappedItem.coDocId} not found.`);
                 continue;
             }
             const outcomeItemExists = coDoc.outcomes.some(item => item.index === mappedItem.coIndex);
             if (!outcomeItemExists) {
                 errors.push(`CO Index ${mappedItem.coIndex} does not exist within Course Outcome document ${mappedItem.coDocId}.`);
             }
        }
    }


    // Check if total mapped marks match the assessment's total max marks (using tolerance)
    // The schema validation also does this, but explicit API validation gives a better error response
    const floatingPointTolerance = 0.001; // Define tolerance
     if (Math.abs(totalMappedMarks - totalMaxMarks) > floatingPointTolerance) {
        errors.push(`Sum of mapped marks (${totalMappedMarks.toFixed(2)}) must equal Total Max Marks (${totalMaxMarks}).`);
     }

     // Check if at least one mapped CO has marks > 0, if totalMaxMarks > 0
     if (totalMaxMarks > 0 && coMapping.every(item => Number(item.maxMarks) <= 0)) {
         errors.push('At least one Course Outcome must be mapped with marks greater than 0.');
     }


    return { isValid: errors.length === 0, errors };
}


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

        const query = { subject: subjectId };
        if (academicYear) query.academicYear = academicYear;
        if (sem) query.sem = sem;

        const assessments = await Assessment.find(query)
            .populate({
                 // Populate the referenced CourseOutcome document
                path: 'coMapping.courseOutcome',
                 // Select the 'outcomes' array so the frontend can find the specific CO details by coIndex
                 // Add any other fields needed for the CO document itself (like institute, department, academicYear if relevant)
                select: 'outcomes institute department academicYear'
            })
            .sort({ academicYear: -1, sem: -1, assessmentDate: 1, name: 1 }); // Added sorting by year/sem

        return NextResponse.json({ success: true, data: assessments }, { status: 200 });

    } catch (error) {
        console.error("API Error fetching assessments:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { name, type, subject, academicYear, sem, maxMarks, assessmentDate, coMapping } = body;

        // --- Basic Required Field Validation ---
        if (!name || !type || !subject || !academicYear || !sem || maxMarks === undefined || !Array.isArray(coMapping)) {
             console.error("Missing required fields:", body);
            return NextResponse.json({ success: false, message: 'Missing required fields (name, type, subject, academicYear, sem, maxMarks, coMapping array).' }, { status: 400 });
        }

        // --- Type and Format Validation ---
        if (!mongoose.Types.ObjectId.isValid(subject)) {
            return NextResponse.json({ message: "Invalid Subject ID format" }, { status: 400 });
        }
        if (typeof maxMarks !== 'number' || maxMarks < 0) {
            return NextResponse.json({ success: false, message: 'maxMarks must be a non-negative number.' }, { status: 400 });
        }
         // Optional: Validate assessmentDate format if provided
         if (assessmentDate && isNaN(new Date(assessmentDate).getTime())) {
              return NextResponse.json({ success: false, message: 'Invalid assessmentDate format.' }, { status: 400 });
         }


        // --- Business Logic Validation ---
        // 1. Check if Subject exists
        const subjectExists = await Subject.findById(subject);
        if (!subjectExists) {
            return NextResponse.json({ success: false, message: `Subject with ID ${subject} not found.` }, { status: 400 });
        }
         // Optional: Check if academicYear and sem match the subject? Depends on your data model design.
         // For now, we'll assume the provided academicYear and sem in the body are intended for the assessment record.

        // 2. Validate coMapping structure and content
        const { isValid, errors } = await validateCoMapping(coMapping, subject, maxMarks);
        if (!isValid) {
            // Combine coMapping errors into a single message or return the array
            return NextResponse.json({ success: false, message: 'coMapping validation failed.', errors: errors }, { status: 400 });
        }

        // --- Create and Save Assessment ---
        const newAssessmentData = {
            name,
            type,
            subject,
            academicYear,
            sem,
            maxMarks,
            assessmentDate: assessmentDate ? new Date(assessmentDate) : null, // Convert date string to Date object
            coMapping: coMapping.map(item => ({ // Ensure structure matches schema
                 courseOutcome: new mongoose.Types.ObjectId(item.courseOutcome), // Ensure it's an ObjectId
                 coIndex: Number(item.coIndex), // Ensure it's a number
                 maxMarks: Number(item.maxMarks) // Ensure it's a number
            }))
        };

        const newAssessment = new Assessment(newAssessmentData);
        await newAssessment.save(); // Mongoose schema validation will run here too

        // Populate before returning for frontend display
        await newAssessment.populate({
             path: 'coMapping.courseOutcome',
             select: 'outcomes institute department academicYear' // Populate relevant CO fields
        });


        return NextResponse.json({ success: true, data: newAssessment, message: "Assessment created successfully." }, { status: 201 });

    } catch (error) {
        console.error("API Error creating assessment:", error);
        if (error.name === 'ValidationError') {
            // Mongoose validation error
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return NextResponse.json({ success: false, message: "Validation failed.", errors: errors }, { status: 400 });
        }
        // Other errors (database, logic errors, etc.)
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}