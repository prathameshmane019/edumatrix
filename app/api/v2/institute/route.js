
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Institute from "@/models/Institute";// Import the Institute model

// POST - Create a new institute
export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();

    const { name, address, contact, email, instituteCode,password} = data;
    console.log(data);

    const newInstitute = new Institute({
      name,
      address,
      contact,
      email,
      instituteCode,
      password
    });

    await newInstitute.save();
    console.log("Institute Registered Successfully", newInstitute);
    return NextResponse.json({
      message: "Institute Registered Successfully",
      institute: newInstitute,
    });
  } catch (error) {
    console.error("Error creating institute:", error);
    return NextResponse.json({ error: "Failed to Register Institute" });
  }
}

// PUT - Update an existing institute
export async function PUT(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    console.log(data);

    const { name, address, contact, email,password ,instituteCode} = data;
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get("_id");

    const updatedInstitute = await Institute.findByIdAndUpdate(
      _id,
      {
        name,
        address,
        contact,
        email,
        password,
        instituteCode
      },
      { new: true }
    );

    if (!updatedInstitute) {
      return NextResponse.json({ error: "Institute not found" });
    }

    console.log("Institute Updated Successfully", updatedInstitute);
    return NextResponse.json({
      message: "Institute Updated Successfully",
      institute: updatedInstitute,
    });
  } catch (error) {
    console.error("Error updating institute:", error);
    return NextResponse.json({ error: "Failed to Update Institute" });
}
}


// DELETE - Delete an institute
export async function DELETE(req) {
try {
  await connectMongoDB();
  const { searchParams } = new URL(req.url);
  const _id = searchParams.get("_id");

  const deletedInstitute = await Institute.findByIdAndDelete(_id);

  if (!deletedInstitute) {
    return NextResponse.json({ error: "Institute not found" });
  }

  console.log("Institute Deleted Successfully", deletedInstitute);
  return NextResponse.json({ message: "Institute Deleted Successfully" });
} catch (error) {
  console.error("Error deleting institute:", error);
  return NextResponse.json({ error: "Failed to Delete Institute" });
}
}
export async function GET(req) {
    try {
      await connectMongoDB();
      const { searchParams } = new URL(req.url);
      const _id = searchParams.get("_id"); // Check for _id parameter
      const email = searchParams.get("email"); // Check for email parameter
  
      let response;
      if (_id || email) {
        // Fetch a single institute by _id or email
        const query = _id ? { _id } : { email };
        response = await Institute.findOne(query);
  
        if (!response) {
          return NextResponse.json({ error: "Institute not found" }, { status: 404 });
        }
  
        console.log("Fetched Single Institute Successfully", response);
      } else {
        // Fetch all institutes if no specific parameter is provided
        response = await Institute.find();
        console.log("Fetched All Institutes Successfully", response);
      }
  
      return NextResponse.json(response);
    } catch (error) {
      console.error("Error fetching institute(s):", error);
      return NextResponse.json({ error: "Failed to Fetch Institute(s)" }, { status: 500 });
    }
  }
  