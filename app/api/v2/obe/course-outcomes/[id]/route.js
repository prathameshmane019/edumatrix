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
        const { outcomeIndex, updatedOutcome } = await req.json();
        console.log("[API - PUT] Request Body:", { outcomeIndex, updatedOutcome });

        const courseOutcome = await CourseOutcome.findById(id);
        if (!courseOutcome) {
            return NextResponse.json({ success: false, message: "Course Outcome document not found" }, { status: 404 });
        }

        const outcomeToUpdateIndex = courseOutcome.outcomes.findIndex(
            (outcome) => outcome.index === parseInt(outcomeIndex)
        );

        if (outcomeToUpdateIndex === -1) {
            return NextResponse.json({ success: false, message: "Course Outcome to update not found" }, { status: 404 });
        }

        // Update the specific outcome
        courseOutcome.outcomes[outcomeToUpdateIndex] = {
            ...courseOutcome.outcomes[outcomeToUpdateIndex],
            ...updatedOutcome
        };

        const updatedCourseOutcome = await courseOutcome.save();

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
        const { outcomeIndex } = await req.json();

        const courseOutcome = await CourseOutcome.findById(id);
        if (!courseOutcome) {
            return NextResponse.json({ success: false, message: "Course Outcome document not found" }, { status: 404 });
        }

        // Filter out the outcome to be deleted
        courseOutcome.outcomes = courseOutcome.outcomes.filter(
            (outcome) => outcome.index !== parseInt(outcomeIndex)
        );

        const updatedCourseOutcome = await courseOutcome.save();

        return NextResponse.json({ success: true, data: updatedCourseOutcome, message: "Course Outcome deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting course outcome:", error);
        return NextResponse.json({ success: false, message: "Failed to delete course outcome", error: error.message }, { status: 500 });
    }
}