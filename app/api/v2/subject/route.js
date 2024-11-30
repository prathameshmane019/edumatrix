import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import Classes from "@/models/className";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const year = searchParams.get("acadmicYear");
        const sem = searchParams.get("sem");
        console.log(sem, year);
        
        let filter = {};
        if (department) filter.department = department;
        if (sem) filter.sem = sem;
        if (year) filter.academicYear = year;

        await connectMongoDB();
        const subjects = await Subject.find(filter).select("_id subCode name class teacher subType batch isActive");
        const classes = await Classes.find({department, isActive: true}).select('_id batches._id');
        console.log(subjects, classes);
        return NextResponse.json({ subjects, classes }, { status: 200 });
    } catch (error) {
        console.error("Error fetching subjects and teachers:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { subCode, name, class: classId, teacher, department, subType, batch, sem, academicYear, instituteId } = await request.json();
        
        if (!department || !instituteId) {
            return NextResponse.json({error: "department or instituteId is missing"});
        }

        await connectMongoDB();
        const newSubject = new Subject({
            subCode,
            name,
            class: classId,
            teacher,
            department,
            subType,
            batch: subType === 'practical' || subType === 'tg' ? batch : undefined,
            sem,
            academicYear,
            instituteId
        });

        await newSubject.save();
        return NextResponse.json({ message: 'Subject created successfully', subject: newSubject }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Error creating subject' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { _id, subCode, name, class: classId, teacher, department, subType, batch, sem, academicYear, instituteId } = await request.json();

        if(!department || !instituteId){
            console.log("department or instituteId is missing", department, instituteId);
            return NextResponse.json({error: "department or instituteId is missing"});
        }

        await connectMongoDB();
        const updatedSubject = await Subject.findByIdAndUpdate(
            _id,
            {
                subCode,
                name,
                class: classId,
                teacher,
                department,
                subType,
                batch: subType === 'practical' || subType === 'tg' ? batch : undefined,
                sem,
                academicYear,
                instituteId
            },
            { new: true }
        );

        return NextResponse.json({ message: 'Subject updated successfully', subject: updatedSubject }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Error updating subject' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("_id");
        await Subject.findByIdAndDelete(id);
        return NextResponse.json({ message: "Subject deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
    }
}
