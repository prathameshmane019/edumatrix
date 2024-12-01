import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Faculty from "@/models/faculty";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Student from "@/models/student";
import mongoose from "mongoose";

export async function POST(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { 
            id, 
            name, 
            department, 
            email, 
            password, 
            institute,
            currentYear,
            sem
        } = data;

        if(!department){
            return NextResponse.json({error:"department is missing"}, { status: 400 });
        }

        // Retrieve the logged-in user's institute or use a default
        const instituteId = institute || (await Institute.findOne()).id;

        const newFaculty = new Faculty({
            id,
            name,
            department,
            email,
            password,
            institute: instituteId,
            currentYear,
            sem
        });

        await newFaculty.save();
        console.log("Faculty Registered Successfully", newFaculty);
        return NextResponse.json({ 
            message: "Faculty Registered Successfully", 
            faculty: newFaculty 
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating faculty:", error);
        return NextResponse.json({ error: "Failed to Register" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { 
            id, 
            name, 
            department, 
            email, 
            password, 
            institute,
            currentYear,
            sem 
        } = data;

        const updateData = {
            name,
            department,
            email,
            password,
            currentYear,
            sem
        };

        // Only include institute if provided
        if (institute) {
            updateData.institute = institute;
        }

        const existingFaculty = await Faculty.findOneAndUpdate(
            { id },
            updateData,
            { new: true }
        );

        if (!existingFaculty) {
            return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
        }

        console.log("Faculty Updated Successfully", existingFaculty);
        return NextResponse.json({ 
            message: "Faculty Updated Successfully", 
            faculty: existingFaculty 
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating faculty:", error);
        return NextResponse.json({ error: "Failed to Update" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const department = searchParams.get("department");

        let filter = {};
        if (department) filter.department = department;

        if (id) {
            const faculty = await Faculty.findOne({ id })
                .populate('institute', 'name')
                .lean();

            if (!faculty) {
                return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
            }

            console.log("Fetched Faculty Successfully", faculty);
            return NextResponse.json(faculty, { status: 200 });
        } else {
            const faculties = await Faculty.find(filter)
                .populate('institute', 'name')
                .lean();

            console.log("Fetched Faculties Successfully", faculties);
            return NextResponse.json(faculties, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching faculties:", error);
        return NextResponse.json({ error: "Failed to Fetch Faculties" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("_id");
            const deletedFaculty = await Faculty.deleteOne({_id:id} )

            if (!deletedFaculty) {
                return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
            }
            console.log("Faculty deleted successfully");
            return NextResponse.json({ 
                message: "Faculty deleted successfully" 
            }, { status: 200 });
        }
     catch (error) {
        console.error("Error deleting faculty:", error);
        return NextResponse.json({ error: "Failed to delete faculty" }, { status: 500 });
    }
}