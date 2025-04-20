import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import ProgramOutcome from "@/models/OBE/ProgramOutcome";
import CourseOutcome from "@/models/OBE/CourseOutcome";
import mongoose from "mongoose";

// PUT handler - Update an outcome
export async function PUT(req, { params }) {
    try {
        await connectMongoDB();
        const { id } = params; // ID of the ProgramOutcome document

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid document ID"
            }, { status: 400 });
        }

        const body = await req.json();
        const { type, index, description, itemId } = body; // Assuming itemId will now be the index to update

        if (!type || !['PO', 'PSO'].includes(type) || !index || !description || !itemId) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields"
            }, { status: 400 });
        }

        const numericIndex = Number(index);
        const numericItemId = Number(itemId); // Convert itemId to a number for comparison
        if (isNaN(numericIndex) || numericIndex < 1 || !Number.isInteger(numericIndex)) {
            return NextResponse.json({
                success: false,
                message: "Index must be a positive integer"
            }, { status: 400 });
        }
        if (isNaN(numericItemId) || numericItemId < 1 || !Number.isInteger(numericItemId)) {
            return NextResponse.json({
                success: false,
                message: "Item ID (index) must be a positive integer"
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

        const targetArray = outcomeDoc[arrayField];
        if (!targetArray) {
            return NextResponse.json({
                success: false,
                message: `${type} array not found in the document`
            }, { status: 404 });
        }

        // Check for duplicate index (excluding the item being updated)
        const duplicateIndex = targetArray.find(
            item => item.index === numericIndex && item.index !== numericItemId
        );

        if (duplicateIndex) {
            return NextResponse.json({
                success: false,
                message: `${type} with index ${numericIndex} already exists`
            }, { status: 409 });
        }

        // Find the index of the outcome to update based on its index (itemId)
        const outcomeIndexToUpdate = targetArray.findIndex(item => item.index === numericItemId);

        if (outcomeIndexToUpdate === -1) {
            return NextResponse.json({
                success: false,
                message: `${type} item with index ${itemId} not found`
            }, { status: 404 });
        }

        outcomeDoc[arrayField][outcomeIndexToUpdate].index = numericIndex;
        outcomeDoc[arrayField][outcomeIndexToUpdate].description = description;

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
// DELETE handler - Delete an outcome
export async function DELETE(req, { params }) {
    try {
        await connectMongoDB();
        const { id } = params;

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const itemIndexToDelete = searchParams.get("itemId"); // Assuming you'll pass the index as itemId

        if (!id || !mongoose.Types.ObjectId.isValid(id) || !type || !['PO', 'PSO'].includes(type) || !itemIndexToDelete) {
            return NextResponse.json({
                success: false,
                message: "Invalid parameters"
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

        const targetArray = outcomeDoc[arrayField];

        if (!targetArray) {
            console.error(`Error: ${arrayField} is undefined in the document.`);
            return NextResponse.json({
                success: false,
                message: `Could not find ${type} array in the document.`
            }, { status: 500 });
        }

        // Find the index of the outcome to delete based on its index
        const outcomeIndex = targetArray.findIndex(item => item.index === Number(itemIndexToDelete));

        if (outcomeIndex === -1) {
            return NextResponse.json({
                success: false,
                message: `${type} with index ${itemIndexToDelete} not found`
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