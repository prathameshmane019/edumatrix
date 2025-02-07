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

        // Validate that department is provided
        if (!department) {
            return NextResponse.json({
                error: "Department is required for student registration"
            }, { status: 400 });
        }

        // Validate that all students have the same department
        const uniqueDepartments = new Set(students.map(student => student.department));
        if (uniqueDepartments.size > 1) {
            return NextResponse.json({
                error: "All students must belong to the same department"
            }, { status: 400 });
        }

        if (!students || students.length === 0) {
            throw new Error("No student data provided");
        }

        // Ensure each student has the correct department
        const processedStudents = students.map(student => ({
            ...student,
            name: student.name.trim(),
            email: student.email.trim().toLowerCase(),
            class: classRef,
            institute: institute,
            department: department, // Override with the provided department
            ...Object.fromEntries(
                Object.entries(student)
                    .filter(([key]) => key !== 'name' && key !== 'email' && key !== 'class' && key !== 'department')
                    .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            )
        }));

        console.log("Processed data:", processedStudents);

        session = await mongoose.startSession();
        session.startTransaction();

        const createdStudents = await Student.insertMany(processedStudents, { session });

        // Get the created student MongoDB _id
        const studentObjectIds = createdStudents.map(student => student._id);

        // Update the class to add student references
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
        console.log(createdStudents);
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
            console.log("Duplicate field occured");
            // const duplicateField = Object.keys(error.keyPattern)[0];
            // const duplicateValue = error.keyValue[duplicateField];
            return NextResponse.json({
                error: `Duplicate students`
            }, { status: 400 });
        } else if (error.validationErrors) {
            // Validation error
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({
                error: "Validation failed",
                details: validationErrors
            }, { status: 400 });
        } else {
            // Generic error
            return NextResponse.json({
                error: "Failed to Register Students",
                details: error.message
            }, { status: 500 });
        }
    }
}