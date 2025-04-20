import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import CourseOutcome from "@/models/OBE/CourseOutcome";
import mongoose from "mongoose";

export async function GET(req, { params }) {
    const { id } = params;
    try {
        await connectMongoDB();
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid Course Outcome ID" }, { status: 400 });
        }
        const courseOutcome = await CourseOutcome.findById(id).populate('subject').populate('programOutcome');
        if (!courseOutcome) {
            return NextResponse.json({ success: false, message: "Course Outcome not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: courseOutcome }, { status: 200 });
    } catch (error) {
        console.error("Error fetching course outcome:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch course outcome", error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const { id } = params;
    try {
        await connectMongoDB();
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid Course Outcome ID" }, { status: 400 });
        }
        const body = await req.json();
        const updatedCourseOutcome = await CourseOutcome.findByIdAndUpdate(id, body, { new: true, runValidators: true }).populate('subject').populate('programOutcome');
        if (!updatedCourseOutcome) {
            return NextResponse.json({ success: false, message: "Course Outcome not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedCourseOutcome }, { status: 200 });
    } catch (error) {
        console.error("Error updating course outcome:", error);
        return NextResponse.json({ success: false, message: "Failed to update course outcome", error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { id } = params;
    try {
        await connectMongoDB();
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid Course Outcome ID" }, { status: 400 });
        }
        const deletedCourseOutcome = await CourseOutcome.findByIdAndDelete(id);
        if (!deletedCourseOutcome) {
            return NextResponse.json({ success: false, message: "Course Outcome not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Course Outcome deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting course outcome:", error);
        return NextResponse.json({ success: false, message: "Failed to delete course outcome", error: error.message }, { status: 500 });
    }
}