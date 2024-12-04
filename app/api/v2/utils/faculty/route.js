import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/connectDb';
import Faculty from '@/models/faculty';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const institute = searchParams.get("institute");
    const department = searchParams.get("department");
    await connectMongoDB();
    
    // Validate instituteId
    if (!institute) {
      return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
    }

    let filter = { institute };
    
    if (department) {
      filter.department = department;
    }

    // Fetch faculty for the given institute and department (if provided)
    const faculty = await Faculty.find(
      filter,
      '_id id name email department' // Select relevant fields
    );

    if (!faculty || faculty.length === 0) {
      return NextResponse.json({ message: "No faculty found for this institute/department" }, { status: 404 });
    }

    console.log(`Fetched ${faculty.length} faculty members for institute ${institute}`);

    // Transform the data for dropdown menu
    const dropdownData = faculty.map(f => ({
      value: f._id,
      label: `${f.name} (${f.id}) - ${f.department}`
    }));

    return NextResponse.json(dropdownData);
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
  }
}

