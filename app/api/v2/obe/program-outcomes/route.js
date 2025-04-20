// app/api/obe/program-outcomes/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import ProgramOutcome from "@/models/ProgramOutcome";
import Institute from "@/models/Institute";
import mongoose from "mongoose";

// GET handler
export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get("institute");
    const department = searchParams.get("dept");
    const academicYear = searchParams.get("year");
    const type = searchParams.get("type"); // 'PO' or 'PSO'

    if (!instituteId || !department || !academicYear) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required parameters: institute, dept, year" 
      }, { status: 400 });
    }

    
    if (!mongoose.Types.ObjectId.isValid(instituteId)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid institute ID" 
      }, { status: 400 });
    }

    let query = {
      institute: instituteId,
      department: department,
      academicYear: academicYear
    };

    const document = await ProgramOutcome.findOne(query);
    
    if (!document) {
      return NextResponse.json({ 
        success: true, 
        data: { programOutcomes: [], programSpecificOutcomes: [] } 
      }, { status: 200 });
    }

    // Return data based on the type requested
    let responseData = {};
    if (type === 'PO') {
      responseData = document.programOutcomes || [];
    } else if (type === 'PSO') {
      responseData = document.programSpecificOutcomes || [];
    } else {
      // If no specific type is requested, return both
      responseData = {
        programOutcomes: document.programOutcomes || [],
        programSpecificOutcomes: document.programSpecificOutcomes || []
      };
    }

    return NextResponse.json({ success: true, data: responseData }, { status: 200 });

  } catch (error) {
    console.error("Error fetching program outcomes:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch program outcomes" 
    }, { status: 500 });
  }
}

// POST handler
export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { institute, department, academicYear, type, index, description } = body;

    // Validation
    if (!institute || !department || !academicYear || !type || !index || !description) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    if (!['PO', 'PSO'].includes(type)) {
      return NextResponse.json({ 
        success: false, 
        message: "Type must be 'PO' or 'PSO'" 
      }, { status: 400 });
    }

    const numericIndex = Number(index);
    if (isNaN(numericIndex) || numericIndex < 1 || !Number.isInteger(numericIndex)) {
      return NextResponse.json({ 
        success: false, 
        message: "Index must be a positive integer" 
      }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(institute)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid institute ID" 
      }, { status: 400 });
    }

    // Check if institute exists
    const instituteExists = await Institute.findById(institute);
    if (!instituteExists) {
      return NextResponse.json({ 
        success: false, 
        message: "Institute not found" 
      }, { status: 404 });
    }

    // Find existing document or create new one
    let outcomeDoc = await ProgramOutcome.findOne({
      institute,
      department,
      academicYear
    });

    if (!outcomeDoc) {
      outcomeDoc = new ProgramOutcome({
        institute,
        department,
        academicYear,
        programOutcomes: [],
        programSpecificOutcomes: []
      });
    }

    // Determine which array to update based on type
    const arrayField = type === 'PO' ? 'programOutcomes' : 'programSpecificOutcomes';
    
    // Check for duplicate index
    const duplicateIndex = outcomeDoc[arrayField].find(item => item.index === numericIndex);
    if (duplicateIndex) {
      return NextResponse.json({ 
        success: false, 
        message: `${type} with index ${numericIndex} already exists` 
      }, { status: 409 });
    }

    // Add new outcome
    outcomeDoc[arrayField].push({
      index: numericIndex,
      description
    });

    // Sort outcomes by index
    outcomeDoc[arrayField].sort((a, b) => a.index - b.index);

    await outcomeDoc.save();

    return NextResponse.json({ 
      success: true, 
      data: outcomeDoc[arrayField],
      message: `${type} added successfully` 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating program outcome:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to create program outcome" 
    }, { status: 500 });
  }
}