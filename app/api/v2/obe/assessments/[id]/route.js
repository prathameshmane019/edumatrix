import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Assessment from "@/models/OBE/Assessment"; // Corrected path if needed, based on your project structure
import Subject from "@/models/subject"; // Corrected path if needed
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Corrected path if needed

// Helper function to validate CO mapping
async function validateCoMapping(coMapping, subjectId, totalMaxMarks) {
  if (!Array.isArray(coMapping) || coMapping.length === 0) {
    // Consider if an empty mapping is valid when totalMaxMarks is 0
    if (totalMaxMarks === 0) {
         return { isValid: true, errors: [] };
    }
    return {
      isValid: false,
      errors: ["At least one Course Outcome must be mapped for non-zero total marks."],
    };
  }

  // Check if sum of maxMarks equals totalMaxMarks
  // Use parseFloat to handle potential string input and ensure numbers before summing
  const totalMappedMarks = coMapping.reduce((sum, item) => sum + Number(item.maxMarks || 0), 0);
  // Use a small tolerance for floating-point comparisons if needed
  if (Math.abs(totalMappedMarks - totalMaxMarks) > 0.01) {
    return {
      isValid: false,
      errors: [
        `Sum of marks mapped to COs (${totalMappedMarks.toFixed(2)}) must equal Total Max Marks (${totalMaxMarks})`,
      ],
    };
  }

  const errors = [];
  for (const mapping of coMapping) {
    // Check for missing fields in each mapping item
    if (mapping.courseOutcome === undefined || mapping.coIndex === undefined || mapping.maxMarks === undefined) {
        errors.push(`Mapping item is missing required fields (courseOutcome, coIndex, maxMarks).`);
        continue; // Skip further checks for this malformed item
    }

    if (!mongoose.Types.ObjectId.isValid(mapping.courseOutcome)) {
      errors.push(`Invalid Course Outcome ID format: ${mapping.courseOutcome}`);
      continue;
    }

    const numericCoIndex = Number(mapping.coIndex);
     if (isNaN(numericCoIndex) || !Number.isInteger(numericCoIndex) || numericCoIndex <= 0) {
        errors.push(`Invalid CO Index: ${mapping.coIndex}. Must be a positive integer.`);
     }

    const numericMaxMarks = Number(mapping.maxMarks);
    if (isNaN(numericMaxMarks) || numericMaxMarks < 0) {
      errors.push(`Invalid maxMarks: ${mapping.maxMarks}. Must be a non-negative number.`);
    }

    // NOTE: This validation helper does NOT check if the `courseOutcome` ID
    // actually exists in the database or if the `coIndex` is valid
    // within that specific CourseOutcome document's outcomes array.
    // That kind of validation would require fetching the CourseOutcome document
    // here or before calling this helper, which might add complexity
    // depending on when and how you want that checked.
  }

  return { isValid: errors.length === 0, errors };
}

// GET handler for single Assessment
export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;

    console.log("Fetching assessment with ID:", id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid or missing Assessment ID" }, { status: 400 });
    }

    const assessment = await Assessment.findById(id)
      .populate({
        path: "coMapping.courseOutcome",
        select: "code description academicYear", // Added academicYear, potentially useful
      })
      .populate("subject", "name code academicYear"); // Added academicYear, potentially useful

    if (!assessment) {
      return NextResponse.json({ success: false, message: "Assessment not found" }, { status: 404 });
    }

    // The error occurred during the serialization of the 'assessment' object here,
    // specifically when accessing virtuals on the populated CourseOutcome documents.
    // The fix is in the CourseOutcome model, not this GET handler.
    return NextResponse.json({ success: true, data: assessment }, { status: 200 });
  } catch (error) {
    console.error(`API Error fetching Assessment:`, error);
    // Check for Mongoose specific errors if needed, though the forEach error was a TypeError
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const { id } = params;
    const body = await req.json();
    const { name, type, subject, academicYear, sem, maxMarks, assessmentDate, coMapping } = body;

    // Fetch existing assessment
    const assessmentToUpdate = await Assessment.findById(id);
    if (!assessmentToUpdate) {
      return NextResponse.json({ success: false, message: "Assessment not found." }, { status: 404 });
    }

    // Basic Validation for presence of required fields
    if (!name || !type || !subject || !academicYear || !sem || maxMarks === undefined || !Array.isArray(coMapping)) {
      console.error("Missing required fields for PUT:", body);
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields (name, type, subject, academicYear, sem, maxMarks, coMapping array) in update data.",
        },
        { status: 400 },
      );
    }

    // Validate Subject ID format
    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return NextResponse.json({ success: false, message: "Invalid Subject ID format in update data" }, { status: 400 });
    }

    // Validate maxMarks type and value
     if (typeof maxMarks !== "number" && typeof maxMarks !== "string") {
       return NextResponse.json(
         { success: false, message: "maxMarks must be a number or numeric string." },
         { status: 400 },
       );
     }
    const numericMaxMarks = Number(maxMarks); // Convert to number early for consistency
    if (isNaN(numericMaxMarks) || numericMaxMarks < 0) {
      return NextResponse.json({ success: false, message: "maxMarks must be a non-negative number." }, { status: 400 });
    }

    // Validate assessmentDate format if provided
    if (assessmentDate && isNaN(new Date(assessmentDate).getTime())) {
      return NextResponse.json({ success: false, message: "Invalid assessmentDate format." }, { status: 400 });
    }

    // Check if subject exists and matches academic year/sem (optional, but good practice)
    // This check is already present, keeping it.
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
       return NextResponse.json({ success: false, message: `Subject with ID ${subject} not found.` }, { status: 400 });
    }
    // Optional: Add check if subject's academicYear/sem matches the input academicYear/sem

    // Validate coMapping using the helper
    const { isValid, errors } = await validateCoMapping(coMapping, subject, numericMaxMarks);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "coMapping validation failed.",
          errors: errors,
        },
        { status: 400 },
      );
    }

    // Update fields on the Mongoose document
    assessmentToUpdate.name = name;
    assessmentToUpdate.type = type;
    assessmentToUpdate.subject = subject;
    assessmentToUpdate.academicYear = academicYear;
    assessmentToUpdate.sem = sem;
    assessmentToUpdate.maxMarks = numericMaxMarks; // Use the validated numeric value
    assessmentToUpdate.assessmentDate = assessmentDate ? new Date(assessmentDate) : null;

    // Ensure coMapping items are correctly structured for Mongoose subdocuments
    assessmentToUpdate.coMapping = coMapping.map(item => ({
        // Ensure IDs are Mongoose ObjectIds
        courseOutcome: new mongoose.Types.ObjectId(item.courseOutcome),
        coIndex: Number(item.coIndex), // Ensure numerical values
        maxMarks: Number(item.maxMarks), // Ensure numerical values
        // Include other fields if AssessmentCoMappingSchema has them (e.g., questionNumbers)
        // questionNumbers: item.questionNumbers
    }));


    // Save the updated document
    await assessmentToUpdate.save();

    // Populate necessary fields before returning the updated document
    await assessmentToUpdate.populate({
      path: "coMapping.courseOutcome",
      select: "code description academicYear", // Added academicYear
    });
    await assessmentToUpdate.populate("subject", "name code academicYear"); // Added academicYear

    return NextResponse.json(
      {
        success: true,
        data: assessmentToUpdate,
        message: "Assessment updated successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API Error updating assessment:", error);
    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      const errors = {};
      // Mongoose ValidationErrors have a specific structure
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed during update.",
          errors: errors,
        },
        { status: 400 }, // Use 400 for validation errors
      );
    }
     // Handle CastError (e.g., invalid ObjectId format for assessment ID in params)
     if (error.name === 'CastError') {
         return NextResponse.json(
             { success: false, message: `Invalid ID format for assessment: ${error.value}` },
             { status: 400 }
         );
     }
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error during update",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid Assessment ID format" }, { status: 400 });
    }

    const deletedAssessment = await Assessment.findByIdAndDelete(id);

    if (!deletedAssessment) {
      return NextResponse.json({ success: false, message: "Assessment not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Assessment deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("API Error deleting assessment:", error);
     if (error.name === 'CastError') {
         return NextResponse.json(
             { success: false, message: `Invalid ID format for assessment: ${error.value}` },
             { status: 400 }
         );
     }
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error during deletion",
        error: error.message,
      },
      { status: 500 },
    );
  }
}