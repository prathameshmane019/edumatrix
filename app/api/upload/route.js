import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import mongoose from "mongoose";

export async function POST(req) {
    let session;
    try {
        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();

        const data = await req.json();
        const { students, class: classRef } = data;
        console.log("Original data:", data);

        if (!students || students.length === 0) {
            throw new Error("No student data provided");
        }

        // Trim and process student data
        const processedStudents = students.map(student => ({
            ...student,
            name: student.name.trim(),
            email: student.email.trim().toLowerCase(),
            class: classRef,
            // Trim all other fields except name
            ...Object.fromEntries(
                Object.entries(student)
                    .filter(([key]) => key !== 'name' && key !== 'email' && key !== 'class')
                    .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            )
        }));

        console.log("Processed data:", processedStudents);

        const createdStudents = await Student.insertMany(processedStudents, { session });
        
        await session.commitTransaction();
        session.endSession();

        console.log("Students Registered Successfully");
        console.log(createdStudents);
        return NextResponse.json({ message: "Students Registered Successfully", students: createdStudents }, { status: 201 });
    } catch (error) {
        console.error("Error creating students:", error);
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        if (error.code === 11000) {
            // Duplicate key error
            const duplicateField = Object.keys(error.keyPattern)[0];
            const duplicateValue = error.keyValue[duplicateField];
            return NextResponse.json({ 
                error: `Duplicate entry for ${duplicateField}: ${duplicateValue}. This student already exists.` 
            }, { status: 400 });
        } else if (error.name === 'ValidationError') {
            // Validation error
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 });
        } else {
            // Generic error
            return NextResponse.json({ error: "Failed to Register Students", details: error.message }, { status: 500 });
        }
    }
}

