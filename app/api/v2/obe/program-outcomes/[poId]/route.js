// app/api/obe/program-outcomes/[poId]/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import ProgramOutcome from "@/models/ProgramOutcome";
import mongoose from "mongoose";
// Import other models if needed for validation during delete (e.g., CourseOutcome)

// GET handler for single Program Outcome
export async function GET(req, { params }) {
    try {
        await connectMongoDB();
        const { poId } = params;

        if (!poId || !mongoose.Types.ObjectId.isValid(poId)) {
            return NextResponse.json({ message: "Invalid or missing Program Outcome ID" }, { status: 400 });
        }

        // --- Auth ---
        // Check if user is authorized to view this specific outcome
        // ---

        const outcome = await ProgramOutcome.findById(poId);

        if (!outcome) {
            return NextResponse.json({ success: false, message: "Program Outcome not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: outcome }, { status: 200 });

    } catch (error) {
        console.error(`API Error fetching PO ${params.poId}:`, error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// PUT handler for updating a Program Outcome
export async function PUT(req, { params }) {
    try {
        await connectMongoDB();
        const { poId } = params;
        const body = await req.json();
        // Exclude fields that shouldn't be easily changed via PUT, like institute or maybe code/year/dept
        const { code, institute, department, academicYear, ...updateData } = body;


        if (!poId || !mongoose.Types.ObjectId.isValid(poId)) {
            return NextResponse.json({ message: "Invalid or missing Program Outcome ID" }, { status: 400 });
        }

        // --- Auth ---
        // Check if user is authorized to update this outcome
        // ---

        // Add validation if necessary (e.g., ensure description is not empty)
         if (updateData.description !== undefined && !updateData.description.trim()) {
            return NextResponse.json({ success: false, message: "Description cannot be empty." }, { status: 400 });
        }


        const updatedOutcome = await ProgramOutcome.findByIdAndUpdate(
            poId,
            updateData, // Only update fields passed in updateData
            { new: true, runValidators: true, context: 'query' }
        );

        if (!updatedOutcome) {
            return NextResponse.json({ success: false, message: "Program Outcome not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedOutcome, message: "Program Outcome updated successfully." }, { status: 200 });

    } catch (error) {
        console.error(`API Error updating PO ${params.poId}:`, error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ success: false, message: "Validation Error", errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// DELETE handler for a Program Outcome
export async function DELETE(req, { params }) {
    try {
        await connectMongoDB();
        const { poId } = params;

        if (!poId || !mongoose.Types.ObjectId.isValid(poId)) {
            return NextResponse.json({ message: "Invalid or missing Program Outcome ID" }, { status: 400 });
        }

        // --- Auth ---
        // Check if user is authorized to delete this outcome
        // ---

        // **Important Check**: Prevent deletion if this PO is mapped in any Course Outcome?
        // const coMappingExists = await CourseOutcome.exists({ 'poMapping.programOutcome': poId });
        // if (coMappingExists) {
        //     return NextResponse.json({ success: false, message: 'Cannot delete: Program Outcome is mapped in one or more Course Outcomes.' }, { status: 400 });
        // }


        const deletedOutcome = await ProgramOutcome.findByIdAndDelete(poId);

        if (!deletedOutcome) {
            return NextResponse.json({ success: false, message: "Program Outcome not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Program Outcome deleted successfully." }, { status: 200 }); // 200 or 204 No Content

    } catch (error) {
        console.error(`API Error deleting PO ${params.poId}:`, error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}