// app/api/obe/program-outcomes/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb"; // Adjust path
import ProgramOutcome from "@/models/ProgramOutcome";
import Institute from "@/models/Institute"; // Assuming you need to validate institute
import mongoose from "mongoose";

// GET handler to fetch multiple Program Outcomes with filtering
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get("institute");
        const department = searchParams.get("dept");
        const academicYear = searchParams.get("year");
        const type = searchParams.get("type"); // PO or PSO

        // --- Auth ---
        // Check if user is authorized to view these outcomes
        // ---

        let query = {};
        if (instituteId) {
             if (!mongoose.Types.ObjectId.isValid(instituteId)) {
                return NextResponse.json({ message: "Invalid Institute ID format" }, { status: 400 });
             }
            query.institute = instituteId;
        }
        if (department) query.department = department;
        if (academicYear) query.academicYear = academicYear;
        if (type) query.type = type;

        const outcomes = await ProgramOutcome.find(query).sort({ code: 1 }); // Sort by code

        return NextResponse.json({ success: true, data: outcomes }, { status: 200 });

    } catch (error) {
        console.error("API Error fetching program outcomes:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

// POST handler to create a new Program Outcome
export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { code, description, type, department, institute, academicYear } = body;

        // --- Auth ---
        // Check if user (e.g., admin) is authorized to create outcomes for this institute/dept
        // ---

        // Basic Validation
        if (!code || !description || !department || !institute || !academicYear) {
            return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
        }

        // Validate Institute exists
         if (!mongoose.Types.ObjectId.isValid(institute)) {
             return NextResponse.json({ message: "Invalid Institute ID format" }, { status: 400 });
         }
        const instituteExists = await Institute.findById(institute);
         if (!instituteExists) {
             return NextResponse.json({ message: `Institute with ID ${institute} not found.` }, { status: 400 });
         }

        // Check for duplicates (Code+Dept+Institute+Year must be unique)
        const existingPO = await ProgramOutcome.findOne({ code, department, institute, academicYear });
        if (existingPO) {
             return NextResponse.json({ success: false, message: `Program Outcome code '${code}' already exists for this department, institute, and academic year.` }, { status: 409 }); // 409 Conflict
        }

        const newOutcome = new ProgramOutcome({
            code,
            description,
            type: type || 'PO', // Default to PO if not provided
            department,
            institute,
            academicYear
        });

        await newOutcome.save();

        return NextResponse.json({ success: true, data: newOutcome, message: "Program Outcome created successfully." }, { status: 201 });

    } catch (error) {
        console.error("API Error creating program outcome:", error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ success: false, message: "Validation Error", errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}