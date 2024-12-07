import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Attendance from "@/models/attendance";
import Subject from "@/models/subject";
import Classes from "@/models/className";
import Student from "@/models/student";

export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const classId = searchParams.get("classId");
        const semester = searchParams.get("semester");
        const subjectId = searchParams.get("subjectId");

        console.log(department,classId,semester,subjectId);
        
        if (!classId || !semester) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // Fetch class data with students
        const classData = await Classes.findOne({ 
            _id: classId,
            // Assuming there's an active status field or we'll remove this filter
            ...(department && { department })
        }).populate({
            path: 'students',
            model: 'Student'
        });

        if (!classData) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        // Prepare subject query based on semester and optional subjectId
        const subjectQuery = subjectId 
            ? { 
                _id: subjectId, 
                class: classId,
                sem: semester
              }
            : { 
                class: classId,
                sem: semester
              };

        const subjects = await Subject.find(subjectQuery);

        if (subjects.length === 0) {
            return NextResponse.json({ error: "No subjects found for the given criteria" }, { status: 404 });
        }

        const subjectIds = subjects.map(s => s._id.toString());

        // Fetch attendance data
        const attendanceData = await Attendance.aggregate([
            {
                $match: {
                    subject: { $in: subjectIds }
                }
            },
            { $unwind: '$records' },
            {
                $group: {
                    _id: {
                        student: '$records.student',
                        subject: '$subject'
                    },
                    totalLectures: { $sum: 1 },
                    presentCount: {
                        $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Process attendance data based on whether it's for a single subject or all subjects
        let processedData;
        
        if (subjectId) {
            // Individual subject view
            processedData = classData.students.map(student => {
                const attendance = attendanceData.find(a => 
                    a._id.student === student._id && 
                    a._id.subject === subjectId
                ) || { totalLectures: 0, presentCount: 0 };

                return {
                    _id: student._id,
                    student: {
                        name: student.name,
                        rollNumber: student.rollNumber
                    },
                    totalLectures: attendance.totalLectures,
                    presentCount: attendance.presentCount,
                    percentage: attendance.totalLectures > 0 
                        ? (attendance.presentCount / attendance.totalLectures) * 100
                        : 0
                };
            });
        } else {
            // Cumulative view
            processedData = classData.students.map(student => {
                const studentAttendance = {
                    _id: student._id,
                    student: {
                        name: student.name,
                        rollNumber: student.rollNumber
                    },
                    theorySubjects: [],
                    practicalSubjects: [],
                    totalLectures: 0,
                    totalPresent: 0
                };

                subjects.forEach(subject => {
                    const attendance = attendanceData.find(a => 
                        a._id.student === student._id && 
                        a._id.subject === subject._id.toString()
                    ) || { totalLectures: 0, presentCount: 0 };

                    const subjectAttendance = {
                        name: subject.name,
                        totalLectures: attendance.totalLectures,
                        presentCount: attendance.presentCount,
                        percentage: attendance.totalLectures > 0 
                            ? (attendance.presentCount / attendance.totalLectures) * 100
                            : 0
                    };

                    if (subject.subType === 'theory' || subject.subType === 'tg') {
                        studentAttendance.theorySubjects.push(subjectAttendance);
                    } else if (subject.subType === 'practical') {
                        studentAttendance.practicalSubjects.push(subjectAttendance);
                    }

                    studentAttendance.totalLectures += attendance.totalLectures;
                    studentAttendance.totalPresent += attendance.presentCount;
                });

                studentAttendance.overallPercentage = studentAttendance.totalLectures > 0
                    ? (studentAttendance.totalPresent / studentAttendance.totalLectures) * 100
                    : 0;

                return studentAttendance;
            });
        }

        const response = {
            classInfo: {
                class: classId,
                semester,
                department: classData.department,
                name: classData.id || classId
            },
            subjects: subjects.map(s => ({
                _id: s._id,
                name: s.name,
                subType: s.subType
            })),
            attendance: processedData.sort((a, b) => 
                a.student.rollNumber.localeCompare(b.student.rollNumber)
            )
        };

        // Add summary for cumulative view
        if (!subjectId) {
            response.summary = {
                totalStudents: processedData.length,
                averageAttendance: (processedData.reduce((sum, student) => 
                    sum + student.overallPercentage, 0) / processedData.length).toFixed(2),
                belowThreshold: processedData.filter(student => 
                    student.overallPercentage < 75).length
            };
        }
        console.log(response);
        
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching admin attendance:", error);
        return NextResponse.json({ 
            error: "Failed to fetch attendance data",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        }, { status: 500 });
    }
}