// app/api/obe/program-outcomes/[id]/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import ProgramOutcome from "@/models/ProgramOutcome";
import CourseOutcome from "@/models/CourseOutcome"; // For DELETE validation
import mongoose from "mongoose";

// PUT handler - Update an outcome
export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid document ID" 
      }, { status: 400 });
    }
    
    const body = await req.json();
    const { type, index, description, itemId } = body;

    if (!type || !['PO', 'PSO'].includes(type) || !index || !description || !itemId) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    const numericIndex = Number(index);
    if (isNaN(numericIndex) || numericIndex < 1 || !Number.isInteger(numericIndex)) {
      return NextResponse.json({ 
        success: false, 
        message: "Index must be a positive integer" 
      }, { status: 400 });
    }

    const arrayField = type === 'PO' ? 'programOutcomes' : 'programSpecificOutcomes';
    
    // Find the document
    const outcomeDoc = await ProgramOutcome.findById(id);
    if (!outcomeDoc) {
      return NextResponse.json({ 
        success: false, 
        message: "Document not found" 
      }, { status: 404 });
    }

    // Check for duplicate index (excluding the item being updated)
    const duplicateIndex = outcomeDoc[arrayField].find(
      item => item.index === numericIndex && item._id.toString() !== itemId
    );
    
    if (duplicateIndex) {
      return NextResponse.json({ 
        success: false, 
        message: `${type} with index ${numericIndex} already exists` 
      }, { status: 409 });
    }

    // Find and update the specific outcome
    const outcomeIndex = outcomeDoc[arrayField].findIndex(item => item._id.toString() === itemId);
    
    if (outcomeIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: `${type} item not found` 
      }, { status: 404 });
    }

    outcomeDoc[arrayField][outcomeIndex].index = numericIndex;
    outcomeDoc[arrayField][outcomeIndex].description = description;

    // Sort outcomes by index
    outcomeDoc[arrayField].sort((a, b) => a.index - b.index);

    await outcomeDoc.save();

    return NextResponse.json({ 
      success: true, 
      data: outcomeDoc[arrayField],
      message: `${type} updated successfully` 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating program outcome:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update program outcome" 
    }, { status: 500 });
  }
}

// DELETE handler - Delete an outcome
export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const itemId = searchParams.get("itemId");

    if (!id || !mongoose.Types.ObjectId.isValid(id) || !type || !['PO', 'PSO'].includes(type) || !itemId) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid parameters" 
      }, { status: 400 });
    }

    // Check if mapped in Course Outcomes (you'll need to adjust this for your schema)
    // const coMappingExists = await CourseOutcome.exists({ 'poMapping.programOutcome': itemId });
    // if (coMappingExists) {
    //   return NextResponse.json({ 
    //     success: false, 
    //     message: 'Cannot delete: Outcome is mapped in one or more Course Outcomes.' 
    //   }, { status: 400 });
    // }

    const arrayField = type === 'PO' ? 'programOutcomes' : 'programSpecificOutcomes';
    
    // Find the document
    const outcomeDoc = await ProgramOutcome.findById(id);
    if (!outcomeDoc) {
      return NextResponse.json({ 
        success: false, 
        message: "Document not found" 
      }, { status: 404 });
    }

    // Find and remove the specific outcome
    const outcomeIndex = outcomeDoc[arrayField].findIndex(item => item._id.toString() === itemId);
    
    if (outcomeIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: `${type} item not found` 
      }, { status: 404 });
    }

    outcomeDoc[arrayField].splice(outcomeIndex, 1);
    await outcomeDoc.save();

    return NextResponse.json({ 
      success: true, 
      data: outcomeDoc[arrayField],
      message: `${type} deleted successfully` 
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting program outcome:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to delete program outcome" 
    }, { status: 500 });
  }
}