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

        // Find student
        const student = await Student.findById(studentId)
            .select('name rollNumber class institute')
            .lean();

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Find all subjects for the student's class
        const subjects = await Subject.find({
            class: student.class,
            sem: semester,
            academicYear: academicYear,
            institute: student.institute
        }).lean();

        if (!subjects.length) {
            return NextResponse.json({ error: "No subjects found" }, { status: 404 });
        }

        const attendanceResults = await Promise.all(
            subjects.map(async (subject) => {
                const matchQuery = {
                    subject: subject._id.toString(), // Subject reference is stored as string
                    institute: student.institute
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
                            'records.student': studentId // Student ID is stored as string like "24FYA01"
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
        console.log(attendanceResults);

        return NextResponse.json({
            studentInfo: {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber
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