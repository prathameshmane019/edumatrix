import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Student from "@/models/student";
import mongoose from "mongoose";

export async function POST(req) {
    try {
        const data = await req.json();
        console.log(data);
        await connectMongoDB();

        const { _id, rollNumber, name, year, email, phoneNo, password, department, institute } = data;
        if (!year || !institute || !rollNumber || !name) {
            return NextResponse.json({ error: "Missing required fields: year, institute, rollNumber, or name" }, { status: 400 });
        }

        const newStudent = new Student({
            _id,
            rollNumber,
            name,
            year,
            email,
            phoneNo,
            password: password || "1234",
            department,
            institute
        });

        await newStudent.save();
        console.log("Student Registered Successfully", newStudent);

        return NextResponse.json({ message: "Student Registered Successfully", student: newStudent }, { status: 201 });
    } catch (error) {
        console.error("Error creating student:", error);
        return NextResponse.json({ error: "Failed to Register Student" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectMongoDB();
        const data = await req.json();
        const { _id, rollNumber, name, year, email, phoneNo, password, department, institute } = data;

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
                institute
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
        if (className) {
            // Ensure className is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(className)) {
                return NextResponse.json({ error: "Invalid class ID format" }, { status: 400 });
            }
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
