import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Faculty from "@/models/faculty";
import mongoose from "mongoose";

export async function POST(req) {
    let session;
    try {
        await connectMongoDB();
        session = await mongoose.startSession();
        session.startTransaction();
        
        const data = await req.json();
        const { faculty } = data;
        console.log("Original data:", data);
        
        // Validate required fields
        const missingRequiredFields = faculty.some(member => !member.id || !member.name || !member.email || !member.institute);
        if (missingRequiredFields) {
            throw new Error("Missing required fields: id, name, email, or institute");
        }
        
        // Trim and process faculty data
        const processedFaculty = faculty.map(member => ({
            ...member,
            name: member.name.trim(),
            email: member.email.trim().toLowerCase(),
            id: member.id.trim(),
            // Convert string dates to Date objects if they exist
            dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : undefined,
            dateOfJoining: member.dateOfJoining ? new Date(member.dateOfJoining) : undefined,
            // Convert string ObjectIds to proper ObjectIds if needed
            institute: mongoose.Types.ObjectId.isValid(member.institute) 
                ? member.institute 
                : new mongoose.Types.ObjectId(member.institute),
            classes: member.classes && mongoose.Types.ObjectId.isValid(member.classes) 
                ? member.classes 
                : member.classes ? new mongoose.Types.ObjectId(member.classes) : undefined,
            // Trim all other string fields
            ...Object.fromEntries(
                Object.entries(member)
                    .filter(([key]) => !['name', 'email', 'id', 'dateOfBirth', 'dateOfJoining', 'institute', 'classes'].includes(key))
                    .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            ),
            // Ensure education object has all fields properly trimmed
            education: member.education ? {
                highestDegree: member.education.highestDegree ? member.education.highestDegree.trim() : undefined,
                specialization: member.education.specialization ? member.education.specialization.trim() : undefined,
                university: member.education.university ? member.education.university.trim() : undefined,
                yearOfPassing: member.education.yearOfPassing
            } : undefined
        }));
        
        console.log("Processed data:", processedFaculty);
        
        // Use updateOne with upsert option to handle unique constraints properly
        const bulkOps = processedFaculty.map(member => ({
            updateOne: {
                filter: { id: member.id },  // Use id as the primary filter since it's unique
                update: { $set: member },
                upsert: true
            }
        }));
        
        const result = await Faculty.bulkWrite(bulkOps, { session });
        
        await session.commitTransaction();
        session.endSession();
        
        console.log("Faculty Uploaded Successfully");
        console.log(result);
        return NextResponse.json({ message: "Faculty Uploaded Successfully", result }, { status: 201 });
    } catch (error) {
        console.error("Error uploading faculty:", error);
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        
        // Provide more detailed error message for unique constraint violations
        if (error.code === 11000) {
            return NextResponse.json({ 
                error: "Duplicate entry found", 
                details: error.keyValue 
            }, { status: 400 });
        }
        
        return NextResponse.json({ error: error.message || "Failed to Upload Faculty" }, { status: 500 });
    }
}