import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import ProgramOutcome from "@/models/OBE/ProgramOutcome";
import Institute from "@/models/Institute";
import mongoose from "mongoose";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get("institute");
        const department = searchParams.get("dept");
        const academicYear = searchParams.get("year");
        const type = searchParams.get("type");
 
        if (!instituteId || !department || !academicYear) {
            return NextResponse.json({ success: false, message: "Missing required parameters: institute, dept, year" }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(instituteId)) {
            return NextResponse.json({ success: false, message: "Invalid institute ID" }, { status: 400 });
        }

        const document = await ProgramOutcome.findOne({ institute: instituteId, department, academicYear });

        
        if (!document) {
            return NextResponse.json({ success: true, data: { programOutcomes: [], programSpecificOutcomes: [] } }, { status: 200 });
        }
        const _id = document._id ;
        let responseData = {};
        if (type === 'PO') {
            responseData = document.programOutcomes || [];
        } else if (type === 'PSO') {
            responseData = document.programSpecificOutcomes || [];
        } else {
            responseData = {
                programOutcomes: document.programOutcomes || [],
                programSpecificOutcomes: document.programSpecificOutcomes || [],
            };
        }

        return NextResponse.json({ success: true,_id, data: responseData }, { status: 200 });

    } catch (error) {
        console.error("Error fetching program outcomes:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch program outcomes" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { institute, department, academicYear, type, index, description } = body;
        console.log("[API - POST] Received Body:", body);

        if (!institute || !department || !academicYear || !type || !index || !description) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        if (!['PO', 'PSO'].includes(type)) {
            return NextResponse.json({ success: false, message: "Type must be 'PO' or 'PSO'" }, { status: 400 });
        }

        const numericIndex = Number(index);
        if (isNaN(numericIndex) || numericIndex < 1 || !Number.isInteger(numericIndex)) {
            return NextResponse.json({ success: false, message: "Index must be a positive integer" }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(institute)) {
            return NextResponse.json({ success: false, message: "Invalid institute ID" }, { status: 400 });
        }

        const instituteExists = await Institute.findById(institute);
        if (!instituteExists) {
            return NextResponse.json({ success: false, message: "Institute not found" }, { status: 404 });
        }

        const outcomeDoc = await ProgramOutcome.findOne({ institute, department, academicYear });
        let updatedDoc;

        const newOutcomeItem = { index: numericIndex, description };

        if (!outcomeDoc) {
            const newOutcomeData = {
                institute,
                department,
                academicYear,
            };
            if (type === 'PO') {
                newOutcomeData.programOutcomes = [newOutcomeItem];
            } else {
                newOutcomeData.programSpecificOutcomes = [newOutcomeItem];
            }
            updatedDoc = await ProgramOutcome.create(newOutcomeData);
        } else {
            const targetArray = type === 'PO' ? outcomeDoc.programOutcomes : outcomeDoc.programSpecificOutcomes;
            targetArray.push(newOutcomeItem);
            updatedDoc = await outcomeDoc.save();
        }

        const responseData = type === 'PO' ? updatedDoc.programOutcomes : updatedDoc.programSpecificOutcomes;

        return NextResponse.json({ success: true, message: `${type} added successfully`, data: responseData }, { status: 201 });

    } catch (error) {
        console.error("Error creating program outcome:", error);
        return NextResponse.json({ success: false, message: "Failed to create program outcome" }, { status: 500 });
    }
}