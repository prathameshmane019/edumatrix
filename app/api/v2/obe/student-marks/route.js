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

        const assessment = await Assessment.findById(assessmentId)
            .select('studentMarks maxMarks coMapping')
            .lean();

        if (!assessment) {
            return NextResponse.json({ success: false, message: "Assessment not found" }, { status: 404 });
        }

        const studentMarks = assessment.studentMarks.sort((a, b) =>
            a.rollNumber.localeCompare(b.rollNumber)
        );

        const formattedMarks = studentMarks.map(mark => ({
            student: mark.student,
            rollNumber: mark.rollNumber,
            name: mark.name,
            totalMarks: mark.totalMarks,
            coMarks: mark.coMarks || [],
            assessment: assessmentId
        }));

        return NextResponse.json({
            success: true,
            data: {
                studentMarks: formattedMarks,
                coMapping: assessment.coMapping,
                maxMarks: assessment.maxMarks
            }
        });
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
        console.log("Received data:", JSON.stringify(body, null, 2));

        if (!assessmentId || !Array.isArray(students)) {
            return NextResponse.json(
                { success: false, message: "Assessment ID and students array are required" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return NextResponse.json({ success: false, message: "Assessment not found" }, { status: 404 });
        }

        const incomingStudentIds = students.map(s => String(s.student)).filter(id => id);
        console.log("Incoming student IDs:", incomingStudentIds);

        // Replace studentMarks with incoming students, removing any not in the payload
        const errors = [];
        const validCOMappingIndices = assessment.coMapping.map(co => co.coIndex);
        const newStudentMarks = [];

        // Validate for duplicates in incoming data
        const incomingStudentIdSet = new Set(incomingStudentIds);
        if (incomingStudentIdSet.size !== incomingStudentIds.length) {
            return NextResponse.json(
                { success: false, message: "Duplicate student IDs found in the input data." },
                { status: 400 }
            );
        }

        for (const student of students) {
            const studentIdentifier = String(student.student);
            if (!student.rollNumber || !studentIdentifier) {
                errors.push(`Missing roll number or student ID for an entry.`);
                continue;
            }

            // Validate student ID format
            if (!/^[A-Za-z0-9-]+$/.test(studentIdentifier)) {
                errors.push(`Invalid student ID format for ${student.rollNumber}. Use alphanumeric characters and hyphens only.`);
                continue;
            }

            if (!Array.isArray(student.coMarks)) {
                errors.push(`CO marks must be an array for student ${student.rollNumber}.`);
                continue;
            }

            const coMarksErrors = [];
            const studentCOMarks = student.coMarks.filter(coMark => {
                if (!validCOMappingIndices.includes(coMark.coIndex)) {
                    coMarksErrors.push(`Invalid CO index ${coMark.coIndex} for student ${student.rollNumber}.`);
                    return false;
                }
                const coMapping = assessment.coMapping.find(co => co.coIndex === coMark.coIndex);
                if (
                    coMark.marks !== null &&
                    coMark.marks !== "" &&
                    (isNaN(coMark.marks) || coMark.marks < 0 || coMark.marks > coMapping.maxMarks)
                ) {
                    coMarksErrors.push(
                        `Marks for CO${coMark.coIndex} for student ${student.rollNumber} must be between 0 and ${coMapping.maxMarks}.`
                    );
                    return false;
                }
                return true;
            });

            if (coMarksErrors.length > 0) {
                errors.push(...coMarksErrors);
                continue;
            }

            const totalMarks = studentCOMarks.reduce((sum, coMark) => sum + (Number(coMark.marks) || 0), 0);

            newStudentMarks.push({
                student: studentIdentifier,
                rollNumber: student.rollNumber,
                name: student.name || "",
                totalMarks: totalMarks || null,
                coMarks: studentCOMarks.map(coMark => ({
                    coIndex: coMark.coIndex,
                    marks: coMark.marks === "" ? 0 : Number(coMark.marks)
                }))
            });
        }

        if (errors.length > 0) {
            console.log("Validation errors:", errors);
            return NextResponse.json(
                { success: false, message: "Validation errors occurred", errors },
                { status: 400 }
            );
        }

        // Update studentMarks with new data
        assessment.studentMarks = newStudentMarks;
        console.log("Updated studentMarks:", JSON.stringify(assessment.studentMarks, null, 2));

        await assessment.save();

        const updatedAssessment = await Assessment.findById(assessmentId)
            .select('studentMarks')
            .lean();
        const updatedStudentMarks = updatedAssessment.studentMarks.map(mark => ({
            student: mark.student,
            rollNumber: mark.rollNumber,
            name: mark.name,
            totalMarks: mark.totalMarks,
            coMarks: mark.coMarks || [],
            assessment: assessmentId
        }));

        return NextResponse.json({
            success: true,
            message: "Student marks saved successfully",
            data: updatedStudentMarks
        });
    } catch (error) {
        console.error("Error saving student marks:", error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message);
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: validationErrors },
                { status: 400 }
            );
        }
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Duplicate student ID detected in the database." },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Failed to save student marks", error: error.message },
            { status: 500 }
        );
    }
}