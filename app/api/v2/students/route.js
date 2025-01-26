import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import mongoose from "mongoose";
import Classes from "@/models/className";

export async function POST(req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const data = await req.json();
        await connectMongoDB();

        const { _id, rollNumber, name, year, email, phoneNo, password, department, institute, class: classRef } = data;

        if (!year || !institute || !rollNumber || !name || !classRef) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create new student
        const newStudent = new Student({
            _id,
            rollNumber,
            name,
            year,
            email,
            phoneNo,
            password: password || "1234",
            department,
            institute,
            class: classRef
        });

        // Save student
        await newStudent.save({ session });

        // Update class with student reference
        const updatedClass = await Classes.findByIdAndUpdate(
            classRef, 
            { $addToSet: { students: newStudent._id } }, 
            { new: true, session }
        );

        if (!updatedClass) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Commit transaction
        await session.commitTransaction();

        console.log("Student Registered Successfully", newStudent);

        return NextResponse.json({ 
            message: "Student Registered Successfully", 
            student: newStudent 
        }, { status: 201 });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error creating student:", error);
        return NextResponse.json({ error: "Failed to Register Student" }, { status: 500 });
    } finally {
        session.endSession();
    }
}

export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, rollNumber, name, year, email, phoneNo, password, department, institute ,class:classRef} = data;

        if (!_id) {
            return NextResponse.json({ error: "Missing required field: _id" }, { status: 400 });
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            _id,
            {
                rollNumber,
                name,
                year,
                email,
                phoneNo,
                password,
                department,
                institute,
                class:classRef
            },
            { new: true }
        );

        if (!updatedStudent) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        console.log("Student Updated Successfully", updatedStudent);

        return NextResponse.json({ message: "Student Updated Successfully", student: updatedStudent }, { status: 200 });
    } catch (error) {
        console.error("Error updating student:", error);
        return NextResponse.json({ error: "Failed to Update Student" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("_id");
        const department = searchParams.get("department");
        const className = searchParams.get("class");
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 15;
        const filterValue = searchParams.get("filterValue");

        let filter = {};

        if (id) {
            const student = await Student.findById(id);
            if (!student) {
                return NextResponse.json({ error: "Student not found" }, { status: 404 });
            }
            return NextResponse.json(student, { status: 200 });
        }

        if (department) filter.department = department;

        // Add institute to query if provided and is a valid ObjectId
        if (className && mongoose.Types.ObjectId.isValid(className)) {
            filter.class = new mongoose.Types.ObjectId(className);
        }

        console.log(filter);

        if (filterValue) {
            filter.$or = [
                { name: { $regex: filterValue, $options: "i" } },
                { rollNumber: { $regex: filterValue, $options: "i" } }
            ];
        }

        const students = await Student.find(filter)
            .skip((page - 1) * limit)
            .limit(limit);

        const totalStudents = await Student.countDocuments(filter);

        if (students.length === 0) {
            return NextResponse.json({ error: "No students found" }, { status: 404 });
        }

        return NextResponse.json({ students, totalStudents }, { status: 200 });
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Failed to Fetch Students" }, { status: 500 });
    }
}

// DELETE operation - Delete Student
export async function DELETE(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        const deletedStudent = await Student.findByIdAndDelete(_id);

        if (!deletedStudent) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Student Deleted Successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting student:", error);
        return NextResponse.json({ error: "Failed to Delete Student" }, { status: 500 });
    }
}
