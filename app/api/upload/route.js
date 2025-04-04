import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import mongoose from "mongoose";
import Classes from "@/models/className";

export async function POST(req) {
    let session;
    try {
        await connectMongoDB();
        const data = await req.json();

        const { students, class: classRef, department, institute } = data;
        console.log("Original data:", data);

        // Validate required fields
        if (!classRef) {
            return NextResponse.json({
                error: "Class reference is required"
            }, { status: 400 });
        }
        if (!department) {
            return NextResponse.json({
                error: "Department is required for student registration"
            }, { status: 400 });
        }
        if (!institute) {
            return NextResponse.json({
                error: "Institute is required for student registration"
            }, { status: 400 });
        }
        if (!students || !Array.isArray(students) || students.length === 0) {
            return NextResponse.json({
                error: "No student data provided or invalid format"
            }, { status: 400 });
        }

        // Start a transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Process students to match StudentSchema
        const processedStudents = students.map(student => ({
            _id: student._id || undefined, // Allow custom _id or auto-generate
            personalDetails: {
                name: student.personalDetails?.name?.trim(),
                email: student.personalDetails?.email?.trim().toLowerCase(),
                phoneNo: student.personalDetails?.phoneNo?.trim(),
                dateOfBirth: student.personalDetails?.dateOfBirth ? new Date(student.personalDetails.dateOfBirth) : undefined,
                gender: student.personalDetails?.gender
            },
            academicDetails: {
                rollNumber: student.academicDetails?.rollNumber?.trim(),
                admissionDate: student.academicDetails?.admissionDate ? new Date(student.academicDetails.admissionDate) : new Date(),
                department: department, // Use provided department
                class: classRef, // Use provided class reference
                institute: institute // Use provided institute
            },
            admission: {
                admissionNumber: student.admission?.admissionNumber?.trim(),
                admissionDate: student.admission?.admissionDate ? new Date(student.admission.admissionDate) : new Date(),
                categoryType: student.admission?.categoryType || 'merit',
                status: student.admission?.status || 'active'
            },
            parents: {
                name: student.parents?.name?.trim(),
                contact: student.parents?.contact?.trim(),
                email: student.parents?.email?.trim().toLowerCase(),
                occupation: student.parents?.occupation?.trim(),
                relation: student.parents?.relation
            }
        }));

        // Validate required fields for each student
        for (const student of processedStudents) {
            if (!student.personalDetails.name) throw new Error("Name is required for all students");
            if (!student.academicDetails.rollNumber) throw new Error("Roll number is required for all students");
        }

        console.log("Processed students:", processedStudents);

        // Insert students
        const createdStudents = await Student.insertMany(processedStudents, { session });

        // Get student IDs
        const studentObjectIds = createdStudents.map(student => student._id);

        // Update class with student references
        const updatedClass = await Classes.findOneAndUpdate(
            { _id: classRef },
            { $addToSet: { students: { $each: studentObjectIds } } },
            { session, new: true }
        );

        if (!updatedClass) {
            throw new Error(`Class with ID ${classRef} not found`);
        }

        await session.commitTransaction();
        session.endSession();

        console.log("Students Registered Successfully");
        return NextResponse.json({
            message: "Students Registered Successfully",
            students: createdStudents
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating students:", error);

        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            const duplicateValue = error.keyValue[duplicateField];
            return NextResponse.json({
                error: `Duplicate ${duplicateField}: ${duplicateValue}`
            }, { status: 400 });
        } else if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({
                error: "Validation failed",
                details: validationErrors
            }, { status: 400 });
        } else {
            return NextResponse.json({
                error: "Failed to Register Students",
                details: error.message
            }, { status: 500 });
        }
    }
}