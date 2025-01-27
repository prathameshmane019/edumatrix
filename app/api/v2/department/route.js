import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Department from "@/models/department";

export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();

    const { name, id, password, institute, email } = data;
    console.log(data);
    const newDepartment = new Department({
      id,
      name,
      password,
      institute,
      email
    });

    await newDepartment.save();
    console.log("Department Registered Successfully", newDepartment);
    return NextResponse.json({
      message: "Department Registered Successfully",
      department: newDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json({ error: "Failed to Register" });
  }
}

export async function PUT(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    console.log(data);
    const { name, id, password, institute, email } = data;
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get("_id");
    const existingDepartment = await Department.findByIdAndUpdate(
      _id,
      {
        name,
        id,
        password,
        institute,
        email
      },
      { new: true }
    );
    console.log(existingDepartment);
    if (!existingDepartment) {
      return NextResponse.json({ error: "Department not found" });
    }
    console.log("Department Updated Successfully", existingDepartment);
    return NextResponse.json({
      message: "Department Updated Successfully",
      department: existingDepartment,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json({ error: "Failed to Update" });
  }
}

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get("_id");
    const institute = searchParams.get("institute");
    let department
    if (_id) {
      department = await Department.findById(_id).populate("institute","name address university");
      return NextResponse.json(department);
    }
    department = await Department.find({ institute });
    if (department.length == 0) {
      return NextResponse.json({ status: 404, message: "No departments found" });
    }
    console.log("Fetched Data Successfully", department);
    return NextResponse.json(department);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Failed to Fetch Departments" });
  }
}

export async function DELETE(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get("_id");
    const deletedDepartment = await Department.findByIdAndDelete(_id);

    if (!deletedDepartment) {
      return NextResponse.json({ error: "Department not found" });
    }

    console.log("Department Deleted Successfully", deletedDepartment);
    return NextResponse.json({ message: "Department Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json({ error: "Failed to Delete" });
  }
}
