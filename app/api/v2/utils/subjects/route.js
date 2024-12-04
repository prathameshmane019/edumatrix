// Subject Dropdown API
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/connectDb';
import Subject from '@/models/subject';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const institute = searchParams.get("institute");
    const department = searchParams.get("department");
    const subType = searchParams.get("subType");
    const sem = searchParams.get("sem");
    const academicYear = searchParams.get("academicYear");
    const teacher = searchParams.get("facultyId");

    await connectMongoDB();

    // Validate institute
    if (!institute) {
      return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
    }

    // Construct dynamic filter
    const filter = { institute };

    // Optional filters
    if (department) filter.department = department;
    if (subType) filter.subType = subType;
    if (sem) filter.sem = sem;
    if (teacher) filter.teacher = teacher;
    if (academicYear) filter.academicYear = academicYear;

    // Fetch subjects with specified filters
    const subjects = await Subject.find(
      filter,
      '_id id name subType department sem academicYear'
    ).populate('teacher', 'name');

    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ message: "No subjects found" }, { status: 404 });
    }

    // Transform data for dropdown
    const dropdownData = subjects.map(subject => ({
      value: subject._id,
      label: `${subject.name} (${subject.id}) - ${subject.subType} - ${subject.sem}`,
      type:subject.subType
    }));
console.log(dropdownData);

    return NextResponse.json(dropdownData,{status:200});
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

