import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Student from "@/models/student";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");  // This will be like "24FYA01"
        const semester = searchParams.get("semester");    // This will be like "sem1"
        const academicYear = searchParams.get("academicYear"); // This will be like "2024-2025"

        if (!studentId || !semester || !academicYear) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // Find student with updated schema
        const student = await Student.findById(studentId)
            .select('personalDetails.name academicDetails.rollNumber academicDetails.class academicDetails.institute')
            .lean();

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Find all subjects for the student's class
        const subjects = await Subject.find({
            class: student.academicDetails.class,
            sem: semester,
            academicYear: academicYear,
            institute: student.academicDetails.institute
        }).lean();

        if (!subjects.length) {
            return NextResponse.json({ error: "No subjects found" }, { status: 404 });
        }

        const attendanceResults = await Promise.all(
            subjects.map(async (subject) => {
                const matchQuery = {
                    subject: subject._id.toString(),
                    institute: student.academicDetails.institute
                };

                // For practical subjects, check the batch
                if (subject.subType === 'practical' && subject.batch?.length) {
                    matchQuery.batch = { $in: subject.batch };
                }

                const attendance = await Attendance.aggregate([
                    {
                        $match: matchQuery
                    },
                    {
                        $unwind: '$records'
                    },
                    {
                        $match: {
                            'records.student': studentId
                        }
                    },
                    {
                        $group: {
                            _id: '$subject',
                            totalLectures: { $sum: 1 },
                            presentCount: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$records.status', 'present'] },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ]);

                const attendanceData = attendance[0] || {
                    totalLectures: 0,
                    presentCount: 0
                };

                // Find relevant batch faculty if it's a practical subject
                let facultyInfo = null;
                if (subject.subType === 'practical' && subject.batchFaculties) {
                    const batchFaculty = subject.batchFaculties.find(bf =>
                        matchQuery.batch && matchQuery.batch.$in.includes(bf.batchId)
                    );
                    if (batchFaculty) {
                        facultyInfo = {
                            batchId: batchFaculty.batchId,
                            facultyId: batchFaculty.faculty
                        };
                    }
                }

                return {
                    subjectId: subject._id,
                    subjectName: subject.name,
                    subjectType: subject.subType,
                    batch: subject.subType === 'practical' ? matchQuery.batch?.$in : null,
                    facultyInfo,
                    totalLectures: attendanceData.totalLectures,
                    presentCount: attendanceData.presentCount,
                    percentage: attendanceData.totalLectures > 0
                        ? ((attendanceData.presentCount / attendanceData.totalLectures) * 100).toFixed(2)
                        : '0.00'
                };
            })
        );

        return NextResponse.json({
            studentInfo: {
                id: student._id,
                name: student.personalDetails.name,
                rollNumber: student.academicDetails.rollNumber
            },
            semester,
            academicYear,
            attendance: attendanceResults.sort((a, b) => a.subjectName.localeCompare(b.subjectName))
        }, { status: 200 });

    } catch (error) {
        console.error("Attendance Fetch Error:", error);
        return NextResponse.json({
            error: "Failed to fetch attendance",
            details: error.message
        }, { status: 500 });
    }
}