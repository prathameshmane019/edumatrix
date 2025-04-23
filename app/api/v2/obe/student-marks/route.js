// app/api/v2/obe/student-marks/route.js
import { NextResponse } from "next/server";
import Assessment from "@/models/OBE/Assessment";
import { connectMongoDB } from "@/lib/connectDb";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const assessmentId = searchParams.get("assessmentId");

        if (!assessmentId) {
            return NextResponse.json({ success: false, message: "Assessment ID is required" }, { status: 400 });
        }

        await connectMongoDB();

        // Find the assessment and get its student marks
        // Select only studentMarks and maxMarks for efficiency if needed, but populating student might be useful later
        const assessment = await Assessment.findById(assessmentId)
            .select('studentMarks maxMarks') // Select necessary fields
            .lean(); // Use lean() for faster reads if no Mongoose methods are needed on the result

        if (!assessment) {
            return NextResponse.json({ success: false, message: "Assessment not found" }, { status: 404 });
        }

        // Sort student marks by roll number (client can do this, but backend can pre-sort)
        // If using lean(), studentMarks is a plain array
        const studentMarks = assessment.studentMarks.sort((a, b) =>
            a.rollNumber.localeCompare(b.rollNumber)
        );

        // Transform to match the desired frontend structure (which used _id,
        // but we should align with the backend's 'student' field as the identifier)
        // However, the original frontend code *was* using _id as a local key,
        // let's map backend's 'student' to frontend's '_id' for minimal frontend changes
        // while being mindful the backend stores it as 'student'.
        // A better approach would be to change the frontend to use 'student' as the key,
        // but let's match the original client's expected _id structure for now,
        // mapping it from the backend's 'student' field.

        const formattedMarks = studentMarks.map(mark => ({
            _id: mark.student, // Map backend's 'student' field to frontend's '_id'
            rollNumber: mark.rollNumber,
            name: mark.name,
            marks: mark.marks,
            assessment: assessmentId // Include assessment ID as in the original client's expected format
        }));

        return NextResponse.json({ success: true, data: formattedMarks });
    } catch (error) {
        console.error("Error fetching student marks:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch student marks", error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { assessmentId, students } = body;
        console.log("Received data:", body); // Debugging line to check incoming data
        if (!assessmentId || !Array.isArray(students)) {
            return NextResponse.json(
                { success: false, message: "Assessment ID and students array are required" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        // Find the assessment by ID
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return NextResponse.json({ success: false, message: "Assessment not found" }, { status: 404 });
        }

        // Extract all student IDs from the incoming data
        const incomingStudentIds = students.map(s => s._id).filter(id => id); // Filter out empty IDs
        
        // IMPORTANT: Remove students that are not in the incoming list
        // This ensures deleted students stay deleted
        assessment.studentMarks = assessment.studentMarks.filter(mark => {
            // Keep only marks whose student ID is in the incoming list
            return incomingStudentIds.includes(String(mark.student));
        });

        const updatedStudentMarks = [];
        const errors = [];

        // Process student marks updates
        for (const student of students) {
            // Use 'student' as the identifier, falling back to _id if present for compatibility
            // but the backend model uses 'student' field.
            const studentIdentifier = student.student || student._id; // Prioritize 'student' from updated frontend

            if (!student.rollNumber || !studentIdentifier) {
                errors.push(`Missing roll number or student identifier for an entry.`);
                continue; // Skip this student but continue processing others
            }

            // Validate marks
            if (
                student.marks !== null && student.marks !== "" &&
                (isNaN(student.marks) || student.marks < 0 || student.marks > assessment.maxMarks)
            ) {
                errors.push(`Invalid marks for student ${student.rollNumber}. Marks must be between 0 and ${assessment.maxMarks}.`);
                continue; // Skip this student but continue processing others
            }

            // Find existing mark by the 'student' identifier
            const existingMarkIndex = assessment.studentMarks.findIndex(
                mark => String(mark.student) === String(studentIdentifier)
            );

            if (existingMarkIndex >= 0) {
                // Update existing student mark
                assessment.studentMarks[existingMarkIndex] = {
                    student: studentIdentifier, // Use the identifier sent from the frontend
                    rollNumber: student.rollNumber,
                    name: student.name,
                    marks: student.marks === "" ? null : Number(student.marks) // Save "" as null
                };
            } else {
                // Add new student mark
                assessment.studentMarks.push({
                    student: studentIdentifier, // Use the identifier sent from the frontend
                    rollNumber: student.rollNumber,
                    name: student.name,
                    marks: student.marks === "" ? null : Number(student.marks) // Save "" as null
                });
            }
        }

        if (errors.length > 0) {
            // It might be better to return a partial success or ask the user to fix errors,
            // but for now, let's report the errors and still attempt to save valid entries.
            // Or, return a 400 with errors and don't save anything if any error exists.
            // Let's go with returning 400 if any errors are found to force fixing.
            return NextResponse.json(
                { success: false, message: "Validation errors occurred:", errors: errors },
                { status: 400 }
            );
        }


        // Before saving, check for duplicate 'student' identifiers in the incoming data
        const studentIdentifiers = students.map(s => s._id).filter(id => id);
        const uniqueIdentifiers = new Set(studentIdentifiers);
        if (uniqueIdentifiers.size !== studentIdentifiers.length) {
            return NextResponse.json(
                { success: false, message: "Duplicate student identifiers found in the input data." },
                { status: 400 }
            );
        }

        // Save the updated assessment
        // Mongoose will handle subdocument validation (like marks range and student duplicate check) on save
        await assessment.save();

        return NextResponse.json({ success: true, message: "Student marks saved successfully" });
    } catch (error) {
        console.error("Error saving student marks:", error);
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message);
            return NextResponse.json(
                { success: false, message: "Validation failed:", errors: validationErrors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Failed to save student marks", error: error.message },
            { status: 500 }
        );
    }
}