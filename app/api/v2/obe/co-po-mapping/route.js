// app/api/v2/obe/co-po-mapping/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import CourseOutcome from "@/models/OBE/CourseOutcome";
import ProgramOutcome from "@/models/OBE/ProgramOutcome";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectMongoDB();
    
    // Get filter parameters from URL
    const url = new URL(req.url);
    const subject = url.searchParams.get('subject');
    const programOutcomeId = url.searchParams.get('programOutcome');
    
    if (!subject || !programOutcomeId) {
      return NextResponse.json({ 
        success: false, 
        message: "Subject and program outcome IDs are required" 
      }, { status: 400 });
    }
    
    // Get all course outcomes for the subject
    const courseOutcomes = await CourseOutcome.find({ subject })
      .populate('subject')
      .populate({
        path: 'poMapping.programOutcome',
        model: 'ProgramOutcome'
      });
    
    // Get the program outcome document
    const programOutcome = await ProgramOutcome.findById(programOutcomeId);
    
    if (!programOutcome) {
      return NextResponse.json({ 
        success: false, 
        message: "Program outcome not found" 
      }, { status: 404 });
    }
    
    // Create the mapping matrix
    const mappingMatrix = {
      courseOutcomes: courseOutcomes.map(co => ({
        id: co._id,
        code: co.code,
        description: co.description,
        cognitiveLevel: co.cognitiveLevel
      })),
      programOutcomes: {
        pos: programOutcome.programOutcomes.map(po => ({
          id: `PO${po.index}`,
          index: po.index,
          description: po.description
        })),
        psos: programOutcome.programSpecificOutcomes.map(pso => ({
          id: `PSO${pso.index}`,
          index: pso.index,
          description: pso.description
        }))
      },
      mappings: courseOutcomes.flatMap(co => 
        co.poMapping.map(mapping => ({
          courseOutcomeId: co._id,
          programOutcomeId: mapping.programOutcome,
          correlationLevel: mapping.correlationLevel
        }))
      )
    };
    
    return NextResponse.json({ 
      success: true, 
      data: mappingMatrix 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching CO-PO mapping:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch mapping data", 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();
    
    // Validate the request body
    if (!body.mappings || !Array.isArray(body.mappings)) {
      return NextResponse.json({ 
        success: false, 
        message: "Mappings array is required" 
      }, { status: 400 });
    }
    
    // Begin transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Process each mapping
      for (const mapping of body.mappings) {
        const { courseOutcomeId, programOutcomeId, correlationLevel } = mapping;
        
        // Find the course outcome
        const courseOutcome = await CourseOutcome.findById(courseOutcomeId).session(session);
        
        if (!courseOutcome) {
          throw new Error(`Course outcome ${courseOutcomeId} not found`);
        }
        
        // Update or add the mapping
        const existingMappingIndex = courseOutcome.poMapping.findIndex(
          m => m.programOutcome.toString() === programOutcomeId
        );
        
        if (existingMappingIndex >= 0) {
          // Update existing mapping
          courseOutcome.poMapping[existingMappingIndex].correlationLevel = correlationLevel;
        } else {
          // Add new mapping
          courseOutcome.poMapping.push({
            programOutcome: programOutcomeId,
            correlationLevel: correlationLevel
          });
        }
        
        await courseOutcome.save({ session });
      }
      
      // Commit transaction
      await session.commitTransaction();
      
      return NextResponse.json({ 
        success: true, 
        message: "Mappings updated successfully" 
      }, { status: 200 });
      
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }
    
  } catch (error) {
    console.error("Error updating CO-PO mappings:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update mappings", 
      error: error.message 
    }, { status: 500 });
  }
}

// Batch update mappings (useful for matrix-style updates)
export async function PUT(req) {
  try {
    await connectMongoDB();
    const body = await req.json();
    
    // Validate the request body
    if (!body.matrixData || !Array.isArray(body.matrixData)) {
      return NextResponse.json({ 
        success: false, 
        message: "Matrix data is required" 
      }, { status: 400 });
    }
    
    // Begin transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Process each row in the matrix
      for (const row of body.matrixData) {
        const { courseOutcomeId, mappings } = row;
        
        if (!courseOutcomeId || !mappings || !Array.isArray(mappings)) {
          throw new Error("Invalid matrix row format");
        }
        
        // Find the course outcome
        const courseOutcome = await CourseOutcome.findById(courseOutcomeId).session(session);
        
        if (!courseOutcome) {
          throw new Error(`Course outcome ${courseOutcomeId} not found`);
        }
        
        // Replace all mappings
        courseOutcome.poMapping = mappings.map(m => ({
          programOutcome: m.programOutcomeId,
          correlationLevel: m.correlationLevel
        }));
        
        await courseOutcome.save({ session });
      }
      
      // Commit transaction
      await session.commitTransaction();
      
      return NextResponse.json({ 
        success: true, 
        message: "Matrix updated successfully" 
      }, { status: 200 });
      
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }
    
  } catch (error) {
    console.error("Error updating mapping matrix:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update mapping matrix", 
      error: error.message 
    }, { status: 500 });
  }
}