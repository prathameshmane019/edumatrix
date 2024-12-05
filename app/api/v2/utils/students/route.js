import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const classId = searchParams.get("classId");
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 15;

        // Validate classId is provided and is a valid ObjectId
        if (!classId) {
            return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return NextResponse.json({ error: "Invalid Class ID" }, { status: 400 });
        }

        // Verify the class exists first
        const classExists = await Classes.findById(classId);
        if (!classExists) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Fetch students for the specific class
        const students = await Student.find({ class: classId })
            .populate('class', 'name') // Populate class with only name field
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-password'); // Exclude password field

        // Count total students in this class
        const totalStudents = await Student.countDocuments({ class: classId });

        // Handle case when no students are found
        if (students.length === 0) {
            return NextResponse.json({ 
                message: "No students found in this class", 
                students: [], 
                totalStudents: 0 
            }, { status: 200 });
        }

        // Return students with pagination info
        return NextResponse.json({ 
            students, 
            totalStudents,
            currentPage: page,
            totalPages: Math.ceil(totalStudents / limit)
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching students by class:", error);
        return NextResponse.json({ 
            error: "Failed to fetch students", 
            details: error.message 
        }, { status: 500 });
    }
}