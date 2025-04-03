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
            sem,
            // New fields
            contact,
            dateOfBirth,
            address,
            gender,
            designation,
            employmentType,
            dateOfJoining,
            education
        } = data;

        console.log(data);
        
        if(!department){
            return NextResponse.json({error:"department is missing"}, { status: 400 });
        }

        // Check if faculty with the same ID already exists
        const existingFaculty = await Faculty.findOne({ id });
        if (existingFaculty) {
            return NextResponse.json(
                { error: `Faculty with ID ${id} already exists` }, 
                { status: 409 }  // 409 Conflict status code
            );
        }

        // Retrieve the logged-in user's institute or use a default
        const instituteId = institute || (await Institute.findOne()).id;

        // Create faculty object with only provided data
        const facultyData = {
            id,
            name,
            department,
            email,
            password,
            institute: instituteId
        };

        // Add optional fields only if they have values
        if (currentYear) facultyData.currentYear = currentYear;
        if (sem) facultyData.sem = sem;
        if (contact) facultyData.contact = contact;
        if (dateOfBirth) facultyData.dateOfBirth = dateOfBirth;
        if (address) facultyData.address = address;
        if (gender) facultyData.gender = gender;
        if (designation) facultyData.designation = designation;
        if (employmentType) facultyData.employmentType = employmentType;
        if (dateOfJoining) facultyData.dateOfJoining = dateOfJoining;
        
        // Handle education nested object
        if (education) {
            facultyData.education = {};
            if (education.highestDegree) facultyData.education.highestDegree = education.highestDegree;
            if (education.specialization) facultyData.education.specialization = education.specialization;
            if (education.university) facultyData.education.university = education.university;
            if (education.yearOfPassing) facultyData.education.yearOfPassing = education.yearOfPassing;
        }

        const newFaculty = new Faculty(facultyData);

        await newFaculty.save();
        console.log("Faculty Registered Successfully", newFaculty);
        return NextResponse.json({ 
            message: "Faculty Registered Successfully", 
            faculty: newFaculty 
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating faculty:", error);
        
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            const keyValue = error.keyValue ? JSON.stringify(error.keyValue) : 'unknown';
            return NextResponse.json({ 
                error: `Duplicate key error: ${keyValue} already exists` 
            }, { status: 409 });
        }
        
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
            sem,
            // New fields
            contact,
            dateOfBirth,
            address,
            gender,
            designation,
            employmentType,
            dateOfJoining,
            education
        } = data;

        // Initialize update data with only fields that have values
        const updateData = {};
        
        if (name) updateData.name = name;
        if (department) updateData.department = department;
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        if (institute) updateData.institute = institute;
        if (currentYear) updateData.currentYear = currentYear;
        if (sem) updateData.sem = sem;
        if (contact) updateData.contact = contact;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        if (address) updateData.address = address;
        if (gender) updateData.gender = gender;
        if (designation) updateData.designation = designation;
        if (employmentType) updateData.employmentType = employmentType;
        if (dateOfJoining) updateData.dateOfJoining = dateOfJoining;
        
        // Handle education nested object
        if (education) {
            updateData.education = {};
            if (education.highestDegree) updateData.education.highestDegree = education.highestDegree;
            if (education.specialization) updateData.education.specialization = education.specialization;
            if (education.university) updateData.education.university = education.university;
            if (education.yearOfPassing) updateData.education.yearOfPassing = education.yearOfPassing;
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
        return NextResponse.json(
            existingFaculty,
            { status: 200 }
        );

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
        const _id = searchParams.get("_id");
        const department = searchParams.get("department");

        let filter = {};
        if (department) filter.department = department;
        if (_id) filter._id = _id;
        if (id) filter.id = id;

        if (id) {
            const faculty = await Faculty.findOne({ id })
                .populate('institute', 'name address university')
                .lean();

            if (!faculty) {
                return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
            }

            console.log("Fetched Faculty Successfully", faculty);
            return NextResponse.json(faculty, { status: 200 });
        } else {
            const faculties = await Faculty.find(filter)
                .populate('institute', 'name address university')
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
        const deletedFaculty = await Faculty.deleteOne({_id:id})

        if (!deletedFaculty) {
            return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
        }
        console.log("Faculty deleted successfully");
        return NextResponse.json({ 
            message: "Faculty deleted successfully" 
        }, { status: 200 });
    } catch (error) {
        console.error("Error deleting faculty:", error);
        return NextResponse.json({ error: "Failed to delete faculty" }, { status: 500 });
    }
}