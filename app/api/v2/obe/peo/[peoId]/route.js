// app/api/obe/program-educational-objectives/[peoId]/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import ProgramEducationalObjectives from "@/models/OBE/ProgramEducationalObjectiveSchema";
import mongoose from "mongoose";

// GET handler for single PEO by index
export async function GET(req, { params }) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get("institute");
        const academicYear = searchParams.get("year");
        const { peoId } = params; // This will be the index of the PEO
        
        const peoIndex = parseInt(peoId);
        
        if (isNaN(peoIndex)) {
            return NextResponse.json({ message: "Invalid PEO Index" }, { status: 400 });
        }

        if (!instituteId || !academicYear) {
            return NextResponse.json({ 
                success: false, 
                message: "Institute ID and Academic Year are required parameters." 
            }, { status: 400 });
        }

        // Find the document
        const peoDocument = await ProgramEducationalObjectives.findOne({
            institute: instituteId,
            academicYear: academicYear
        });

        if (!peoDocument) {
            return NextResponse.json({ 
                success: false, 
                message: "No PEOs found for this institute and year" 
            }, { status: 404 });
        }

        // Find the specific PEO by index
        const objective = peoDocument.objectives.find(obj => obj.index === peoIndex);
        
        if (!objective) {
            return NextResponse.json({ 
                success: false, 
                message: "PEO not found" 
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: objective }, { status: 200 });
    } catch (error) { 
        console.error("PEO GET Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        }, { status: 500 });
    }
}

// PUT handler for updating a PEO by index
export async function PUT(req, { params }) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { description } = body;
        const { peoId } = params; // This will be the index of the PEO
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get("institute");
        const academicYear = searchParams.get("year");
        
        const peoIndex = parseInt(peoId);
        
        if (isNaN(peoIndex)) {
            return NextResponse.json({ message: "Invalid PEO Index" }, { status: 400 });
        }

        if (!instituteId || !academicYear) {
            return NextResponse.json({ 
                success: false, 
                message: "Institute ID and Academic Year are required parameters." 
            }, { status: 400 });
        }

        if (!description || !description.trim()) {
            return NextResponse.json({ 
                message: "Description cannot be empty." 
            }, { status: 400 });
        }

        // Find and update using MongoDB's positional operator
        const result = await ProgramEducationalObjectives.findOneAndUpdate(
            {
                institute: instituteId,
                academicYear: academicYear,
                "objectives.index": peoIndex
            },
            {
                $set: { "objectives.$.description": description }
            },
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ 
                success: false, 
                message: "PEO not found" 
            }, { status: 404 });
        }

        // Find the updated objective
        const updatedObjective = result.objectives.find(obj => obj.index === peoIndex);

        return NextResponse.json({ 
            success: true, 
            data: updatedObjective, 
            message: "PEO updated." 
        }, { status: 200 });
    } catch (error) { 
        console.error("PEO PUT Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        }, { status: 500 });
    }
}

// DELETE handler for a PEO by index
export async function DELETE(req, { params }) {
    try {
        await connectMongoDB();
        const { peoId } = params; // This will be the index of the PEO
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get("institute");
        const academicYear = searchParams.get("year");
        
        const peoIndex = parseInt(peoId);
        
        if (isNaN(peoIndex)) {
            return NextResponse.json({ message: "Invalid PEO Index" }, { status: 400 });
        }

        if (!instituteId || !academicYear) {
            return NextResponse.json({ 
                success: false, 
                message: "Institute ID and Academic Year are required parameters." 
            }, { status: 400 });
        }

        // Remove the specific objective from the array
        const result = await ProgramEducationalObjectives.findOneAndUpdate(
            {
                institute: instituteId,
                academicYear: academicYear
            },
            {
                $pull: { objectives: { index: peoIndex } }
            },
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ 
                success: false, 
                message: "PEO document not found" 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: "PEO deleted." 
        }, { status: 200 });
    } catch (error) { 
        console.error("PEO DELETE Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        }, { status: 500 });
    }
}