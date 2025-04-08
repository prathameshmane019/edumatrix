import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import Classes from "@/models/className";// Assuming you have a Class model
import mongoose from "mongoose";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const classId = searchParams.get("class"); 
        // Validate classId
        if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
            return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
        }

        // Find the class and get its students array
        const classDocument = await Classes.findById(classId);

        console.log(classDocument);

        if (!classDocument) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Validate students array
        if (!classDocument.students || classDocument.students.length === 0) {
            return NextResponse.json({ message: "No students in this class" }, { status: 404 });
        }

        // Find students using the _id array from the class document
        const students = await Student.find({
            _id: { $in: classDocument.students }
        });
        console.log(students);

        return NextResponse.json({
            students,
            totalStudents: students.length
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching class students:", error);
        return NextResponse.json({ error: "Failed to Fetch Students" }, { status: 500 });
    }
}