import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/connectDb';
import Department from '@/models/department';

export async function GET(
  req
) {
  try {
    const { searchParams } = new URL(req.url);
    const institute = searchParams.get("institute");
    await connectMongoDB();
    
 
    // Validate instituteId
    if (!institute) {
      return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
    }

    // Fetch departments for the given institute
    const departments = await Department.find(
      { institute },
      'id name' // Only select id and name fields
    );

    if (!departments || departments.length === 0) {
      return NextResponse.json({ message: "No departments found for this institute" }, { status: 404 });
    }

    console.log(`Fetched ${departments.length} departments for institute ${institute}`);

    // Transform the data for dropdown menu
    const dropdownData = departments.map(dept => ({
      value: dept.id,
      label: dept.name
    }));

    return NextResponse.json(dropdownData);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

