// app/api/obe/program-educational-objectives/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import ProgramEducationalObjectives from "@/models/OBE/ProgramEducationalObjectiveSchema";
import Institute from "@/models/Institute";
import mongoose from "mongoose";

// GET handler: Get PEOs by institute and year
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get("institute");
        const academicYear = searchParams.get("year");

        // --- Auth Check: User must have permission for this institute ---

        // Validate required filters
        if (!instituteId || !academicYear) {
            return NextResponse.json({ 
                success: false, 
                message: "Institute ID and Academic Year are required parameters." 
            }, { status: 400 });
        }
        
        if (!mongoose.Types.ObjectId.isValid(instituteId)) {
            return NextResponse.json({ 
                message: "Invalid Institute ID" 
            }, { status: 400 });
        }

        // Find the document containing PEOs for this institute and year
        const peoDocument = await ProgramEducationalObjectives.findOne({
            institute: instituteId,
            academicYear: academicYear
        }).populate('institute', 'name');

        // If document exists, return objectives array, otherwise return empty array
        const objectives = peoDocument ? peoDocument.objectives.sort((a, b) => a.index - b.index) : [];

        return NextResponse.json({ success: true, data: objectives }, { status: 200 });

    } catch (error) {
        console.error("API Error fetching PEOs:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        }, { status: 500 });
    }
}

// POST handler: Add a new PEO
export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { index, description, institute, academicYear } = body;

        // --- Auth Check: User must have permission to create PEO for this institute ---

        // Basic Validation
        if (index === undefined || !description || !institute || !academicYear) {
            return NextResponse.json({ 
                success: false, 
                message: "Missing required fields (index, description, institute, academicYear)." 
            }, { status: 400 });
        }
        
        const numericIndex = Number(index);
        if (isNaN(numericIndex) || numericIndex < 1 || !Number.isInteger(numericIndex)) {
            return NextResponse.json({ 
                message: "Index must be a positive integer." 
            }, { status: 400 });
        }
        
        if (!mongoose.Types.ObjectId.isValid(institute)) {
            return NextResponse.json({ 
                message: "Invalid Institute ID" 
            }, { status: 400 });
        }

        // Validate Institute exists
        const instituteExists = await Institute.findById(institute);
        if (!instituteExists) {
            return NextResponse.json({ 
                message: `Institute not found.` 
            }, { status: 400 });
        }

        // Find existing document or create new one
        let peoDocument = await ProgramEducationalObjectives.findOne({
            institute,
            academicYear
        });

        if (peoDocument) {
            // Check for duplicate index
            const hasDuplicateIndex = peoDocument.objectives.some(obj => obj.index === numericIndex);
            if (hasDuplicateIndex) {
                return NextResponse.json({ 
                    success: false, 
                    message: `PEO index ${numericIndex} already exists for this institute and academic year.` 
                }, { status: 409 });
            }

            // Add new objective to array
            peoDocument.objectives.push({ index: numericIndex, description });
            await peoDocument.save();
        } else {
            // Create new document with first objective
            peoDocument = new ProgramEducationalObjectives({
                institute,
                academicYear,
                objectives: [{ index: numericIndex, description }]
            });
            await peoDocument.save();
        }

        return NextResponse.json({ 
            success: true, 
            data: { index: numericIndex, description },
            message: "PEO created successfully." 
        }, { status: 201 });

    } catch (error) {
        console.error("API Error creating PEO:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to create PEO", 
            error: error.message 
        }, { status: 500 });
    }
}