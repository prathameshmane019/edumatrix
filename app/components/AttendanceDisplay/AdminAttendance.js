"use client"

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
  Chip,
  Tabs,
  Tab
} from "@nextui-org/react";
import { Calendar, RefreshCcw, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { getCurrentAcademicYear, getAcademicYears } from '@/app/utils/acadmicYears';
import { DepartmentDropdown } from '../department/DepartmentDropDowns';
import { ClassDropdown } from '../Class/ClassDropdown';
import { SubjectDropdown } from '../subject/SubjectDropdown';

export default function AdminAttendance({ adminId = '', institute = '', department = '', role = '', year, sem }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(sem || 'sem1');
  const [classes, setClasses] = useState([]);
  const [viewType, setViewType] = useState('cumulative');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(department);
  const [academicYear, setAcademicYear] = useState(() => year || getCurrentAcademicYear());
  const [selectedSubjectType, setSelectedSubjectType] = useState('');

  useEffect(() => {
    if (year) setAcademicYear(year);
    if (sem) setSelectedSemester(sem);
  }, [year, sem]);

  const transformAttendanceData = useCallback((data) => {
    if (!data) {
      throw new Error("No data received");
    }

    return {
      ...data,
      attendance: data.attendance.map(student => ({
        ...student,
        subjects: [
          ...student.theorySubjects.map(subject => ({
            ...subject,
            subType: 'theory'
          })),
          ...student.practicalSubjects.map(subject => ({
            ...subject,
            subType: 'practical'
          }))
        ]
      }))
    };
  }, []);

  const compareRollNumbers = (a, b) => {
    const aMatch = a.match(/\d+/);
    const bMatch = b.match(/\d+/);

    if (aMatch && bMatch) {
      const aNum = parseInt(aMatch[0]);
      const bNum = parseInt(bMatch[0]);
      if (aNum !== bNum) return aNum - bNum;
    }

    return a.localeCompare(b);
  };

  const handleClassSelect = (value) => {
    setSelectedClass(value);
  };

  const handleDepartmentSelect = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleApiError = useCallback((error, customMessage) => {
    console.error(customMessage, error);
    const errorMessage = error.response?.data?.error || error.message || customMessage;
    setError(errorMessage);
    setLoading(false);
  }, []);

  const fetchAttendance = useCallback(async () => {
    if (!selectedClass) {
      setError("Please select a class");
      return;
    }

    if (viewType === 'individual' && !selectedSubject) {
      setError("Please select a subject");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setAttendanceData(null);
      const params = {
        classId: selectedClass,
        semester: selectedSemester,
        department: selectedDepartment,
        institute,
        viewType: viewType === "individual" ? "summary" : viewType,
        ...(viewType === 'individual' && { subjectId: selectedSubject })
      };

      const endpoint = viewType === 'individual'
        ? `/api/v2/reports/faculty`
        : '/api/v2/reports/admin';

      const response = await axios.get(endpoint, { params });

      if (!response.data) {
        throw new Error("No data received from server");
      }
      if (viewType === "cumulative") {
        const transformedData = transformAttendanceData(response.data);
        setAttendanceData(transformedData);
      } else {
        setAttendanceData(response.data);
      }
    } catch (err) {
      handleApiError(err, "Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSemester, selectedDepartment, institute, viewType, selectedSubject, transformAttendanceData, handleApiError]);

  const getAttendanceColor = (percentage) => {
    if (typeof percentage !== 'number') return "text-gray-500";
    if (percentage >= 75) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

 const renderSummaryTable = (batchData) => {
  console.log("Batchdata:", batchData);
  if (!batchData || !Array.isArray(batchData) || batchData.length === 0) {
    return <div>No attendance data available</div>;
  }

  const sortedAttendance = [...batchData].sort((a, b) =>
    compareRollNumbers(a.student.rollNumber, b.student.rollNumber)
  );
  console.log("Sorted Attendance:", sortedAttendance);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Table shadow='sm' aria-label="Attendance Summary Table">
        <TableHeader>
          <TableColumn>Roll Number</TableColumn>
          <TableColumn>Student Name</TableColumn>
          <TableColumn>Total Lectures</TableColumn>
          <TableColumn>Present</TableColumn>
          <TableColumn>Attendance %</TableColumn>
        </TableHeader>
        <TableBody>
          {sortedAttendance.map((record, index) => (
            <TableRow 
              key={`${record.student._id}-${index}`} // Better key using student ID
            >
              <TableCell>{record.student.rollNumber}</TableCell>
              <TableCell>{record.student.name}</TableCell>
              <TableCell>{record.totalLectures}</TableCell>
              <TableCell>{record.presentCount}</TableCell>
              <TableCell>
                <Chip
                  color={record.percentage >= 75 ? "success" : "danger"}
                  variant="flat"
                >
                  {record.percentage.toFixed(2)}%
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};
  const renderAttendanceTable = () => {

    console.log("Attendance Data:", attendanceData);
    if (!attendanceData?.attendance?.length) return null;

    const theorySubjects = attendanceData.subjects?.filter(s => s.subType === 'theory') || [];
    const practicalSubjects = attendanceData.subjects?.filter(s => s.subType === 'practical') || [];

    return (
      <motion.div
        className="overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2" rowSpan={2}>Roll No</th>
              <th className="border px-4 py-2" rowSpan={2}>Student Name</th>
              <th className="border px-4 py-2" colSpan={theorySubjects.length * 4}>Theory Subjects</th>
              <th className="border px-4 py-2" colSpan={practicalSubjects.length * 4}>Practical Subjects</th>
              <th className="border px-4 py-2" colSpan={3}>Final Attendance</th>
            </tr>
            <tr>
              {theorySubjects.map(subject => (
                <React.Fragment key={subject._id}>
                  <th className="border px-4 py-2" colSpan={4}>{subject.name}</th>
                </React.Fragment>
              ))}
              {practicalSubjects.map(subject => (
                <React.Fragment key={subject._id}>
                  <th className="border px-4 py-2" colSpan={4}>{subject.name}</th>
                </React.Fragment>
              ))}
              <th className="border px-4 py-2">Total</th>
              <th className="border px-4 py-2">Present</th>
              <th className="border px-4 py-2">%</th>
            </tr>
            <tr>
              <th className="border px-4 py-2" colSpan={2}></th>
              {[...theorySubjects, ...practicalSubjects].map((_, index) => (
                <React.Fragment key={`header-${index}`}>
                  <th className="border px-4 py-2">Total</th>
                  <th className="border px-4 py-2">Present</th>
                  <th className="border px-4 py-2">Hours</th>
                  <th className="border px-4 py-2">%</th>
                </React.Fragment>
              ))}
              <th className="border px-4 py-2" colSpan={3}></th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.attendance.map((student, index) => (
              <motion.tr
                key={student._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                <td className="border px-4 py-2">{student.student.rollNumber}</td>
                <td className="border px-4 py-2">{student.student.name}</td>
                {theorySubjects.map(subject => {
                  const subjectData = student.subjects?.find(s => s.name === subject.name && s.subType === 'theory') || {};
                  const hours = (subjectData.presentCount || 0) * 1; // 1 hour per theory class
                  return (
                    <React.Fragment key={`theory-${subject._id}-${student._id}`}>
                      <td className="border px-4 py-2">{subjectData.totalLectures || 0}</td>
                      <td className="border px-4 py-2">{subjectData.presentCount || 0}</td>
                      <td className="border px-4 py-2">{hours}</td>
                      <td className={`border px-4 py-2 ${getAttendanceColor(subjectData.percentage)}`}>
                        {subjectData.percentage ? subjectData.percentage.toFixed(2) : '0.00'}%
                      </td>
                    </React.Fragment>
                  );
                })}
                {practicalSubjects.map(subject => {
                  const subjectData = student.subjects?.find(s => s.name === subject.name && s.subType === 'practical') || {};
                  const hours = (subjectData.presentCount || 0) * 2; // 2 hours per practical class
                  return (
                    <React.Fragment key={`practical-${subject._id}-${student._id}`}>
                      <td className="border px-4 py-2">{subjectData.totalLectures || 0}</td>
                      <td className="border px-4 py-2">{subjectData.presentCount || 0}</td>
                      <td className="border px-4 py-2">{hours}</td>
                      <td className={`border px-4 py-2 ${getAttendanceColor(subjectData.percentage)}`}>
                        {subjectData.percentage ? subjectData.percentage.toFixed(2) : '0.00'}%
                      </td>
                    </React.Fragment>
                  );
                })}
                <td className="border px-4 py-2">{student.totalLectures}</td>
                <td className="border px-4 py-2">{student.totalPresent}</td>
                <td className={`border px-4 py-2 ${getAttendanceColor(student.overallPercentage)}`}>
                  {student.overallPercentage ? student.overallPercentage.toFixed(2) : '0.00'}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    );
  };

  const handleSubjectSelection = (e) => {
    setSelectedSubject(e);
  };

  const generateExcelReport = useCallback(() => {
    if (!attendanceData?.attendance) return;

    if (viewType === 'individual') {
      const wb = XLSX.utils.book_new();
      const subjectType = attendanceData.subjectInfo?.subType;
      const subjectName = attendanceData.subjectInfo?.name || 'Subject';

      if (subjectType === 'practical' || subjectType === 'tg') {
        // Handle practical and TG subjects with batch-wise data
        Object.entries(attendanceData.attendance).forEach(([batchName, batchData]) => {
          // Create summary data
          const summaryData = [
            ['Subject', subjectName],
            ['Type', subjectType.toUpperCase()],
            ['Batch', batchName],
            ['Total Students', batchData.length],
            ['Average Attendance', `${(batchData.reduce((acc, curr) => acc + curr.percentage, 0) / batchData.length).toFixed(2)}%`],
            ['Below Threshold', batchData.filter(student => student.percentage < 75).length],
            [''],  // Empty row for spacing
          ];

          // Create attendance data
          const attendanceData = [
            ['Roll Number', 'Student Name', 'Total Lectures', 'Present', 'Attendance %'],
            ...batchData.map(student => [
              student.student.rollNumber,
              student.student.name,
              student.totalLectures,
              student.presentCount,
              `${student.percentage.toFixed(2)}%`
            ])
          ];

          // Combine summary and attendance data
          const wsData = [...summaryData, ...attendanceData];
          const ws = XLSX.utils.aoa_to_sheet(wsData);

          // Set column widths
          ws['!cols'] = [
            { wch: 15 }, // First column
            { wch: 25 }, // Second column
            { wch: 15 }, // Third column
            { wch: 15 }, // Fourth column
            { wch: 15 }  // Fifth column
          ];

          // Add styles for summary section
          const summaryRange = XLSX.utils.decode_range('A1:B6');
          for (let R = summaryRange.s.r; R <= summaryRange.e.r; R++) {
            for (let C = summaryRange.s.c; C <= summaryRange.e.c; C++) {
              const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
              if (!ws[cellRef]) continue;
              ws[cellRef].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "EFEFEF" } }
              };
            }
          }

          // Add styles for header row
          const headerRow = 8; // Row index of the attendance data header
          const headerRange = XLSX.utils.decode_range(`A${headerRow}:E${headerRow}`);
          for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: C });
            ws[cellRef].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "DDEBF7" } },
              border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            };
          }

          XLSX.utils.book_append_sheet(wb, ws, `Batch ${batchName}`);
        });
      } else {
        // Handle theory subjects
        // Create summary data
        const summaryData = [
          ['Subject', subjectName],
          ['Type', 'THEORY'],
          ['Total Students', attendanceData.attendance.length],
          ['Average Attendance', `${(attendanceData.attendance.reduce((acc, curr) => acc + curr.percentage, 0) / attendanceData.attendance.length).toFixed(2)}%`],
          ['Below Threshold', attendanceData.attendance.filter(student => student.percentage < 75).length],
          [''],  // Empty row for spacing
        ];

        // Create attendance data
        const attendanceData = [
          ['Roll Number', 'Student Name', 'Total Lectures', 'Present', 'Attendance %'],
          ...attendanceData.attendance.map(student => [
            student.student.rollNumber,
            student.student.name,
            student.totalLectures,
            student.presentCount,
            `${student.percentage.toFixed(2)}%`
          ])
        ];

        // Combine summary and attendance data
        const wsData = [...summaryData, ...attendanceData];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
          { wch: 15 }, // Roll Number
          { wch: 25 }, // Student Name
          { wch: 15 }, // Total Lectures
          { wch: 15 }, // Present
          { wch: 15 }  // Attendance %
        ];

        // Add styles for summary section
        const summaryRange = XLSX.utils.decode_range('A1:B5');
        for (let R = summaryRange.s.r; R <= summaryRange.e.r; R++) {
          for (let C = summaryRange.s.c; C <= summaryRange.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellRef]) continue;
            ws[cellRef].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "EFEFEF" } }
            };
          }
        }

        // Add styles for header row
        const headerRow = 7; // Row index of the attendance data header
        const headerRange = XLSX.utils.decode_range(`A${headerRow}:E${headerRow}`);
        for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
          const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: C });
          ws[cellRef].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "DDEBF7" } },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }

        XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
      }

      XLSX.writeFile(wb, `${subjectName}_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
      return;
    }

    const theorySubjects = attendanceData.subjects?.filter(s => s.subType === 'theory') || [];
    const practicalSubjects = attendanceData.subjects?.filter(s => s.subType === 'practical') || [];

    const headers = [
      ['Student Information', '', 'Theory Subjects', '', '', '', ...Array(Math.max(0, (theorySubjects.length - 1) * 4)).fill(''),
        'Practical Subjects', '', '', '', ...Array(Math.max(0, (practicalSubjects.length - 1) * 4)).fill(''),
        'Final Attendance', '', ''],
      ['Roll Number', 'Student Name',
        ...theorySubjects.map(subject => [subject.name, '', '', '']).flat(),
        ...practicalSubjects.map(subject => [subject.name, '', '', '']).flat(),
        'Overall', '', ''],
      ['', '',
        ...theorySubjects.map(() => ['Total', 'Present', 'Hours', '%']).flat(),
        ...practicalSubjects.map(() => ['Total', 'Present', 'Hours', '%']).flat(),
        'Total', 'Present', '%']
    ];

    const dataRows = attendanceData.attendance.map(student => {
      const row = [
        student.student.rollNumber,
        student.student.name
      ];

      theorySubjects.forEach(subject => {
        const subjectData = student.subjects?.find(s => s.name === subject.name && s.subType === 'theory') || {};
        row.push(
          subjectData.totalLectures || 0,
          subjectData.presentCount || 0,
          (subjectData.presentCount || 0) * 1,
          subjectData.percentage ? `${subjectData.percentage.toFixed(2)}%` : '0.00%'
        );
      });

      practicalSubjects.forEach(subject => {
        const subjectData = student.subjects?.find(s => s.name === subject.name && s.subType === 'practical') || {};
        row.push(
          subjectData.totalLectures || 0,
          subjectData.presentCount || 0,
          (subjectData.presentCount || 0) * 2,
          subjectData.percentage ? `${subjectData.percentage.toFixed(2)}%` : '0.00%'
        );
      });

      row.push(
        student.totalLectures,
        student.totalPresent,
        student.overallPercentage ? `${student.overallPercentage.toFixed(2)}%` : '0.00%'
      );

      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...dataRows]);

    const range = XLSX.utils.decode_range(ws['!ref']);
    const merges = [];

    let currentCol = 2;
    if (theorySubjects.length > 0) {
      merges.push({
        s: { r: 0, c: currentCol },
        e: { r: 0, c: currentCol + (theorySubjects.length * 4) - 1 }
      });
      currentCol += theorySubjects.length * 4;
    }

    if (practicalSubjects.length > 0) {
      merges.push({
        s: { r: 0, c: currentCol },
        e: { r: 0, c: currentCol + (practicalSubjects.length * 4) - 1 }
      });
    }

    const allSubjects = [...theorySubjects, ...practicalSubjects];
    let subjectCol = 2;
    allSubjects.forEach(() => {
      merges.push({
        s: { r: 1, c: subjectCol },
        e: { r: 1, c: subjectCol + 3 }
      });
      subjectCol += 4;
    });

    ws['!merges'] = merges;

    ws['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      ...Array(range.e.c - 1).fill({ wch: 12 })
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `Attendance_Report_${attendanceData.classInfo?.name || selectedClass}_${selectedSemester}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [attendanceData, selectedClass, selectedSemester, viewType]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm mb-6">
          <CardHeader className="flex justify-between items-start flex-col">
            <h1 className="text-2xl font-bold">Attendance Dashboard </h1>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-center gap-4">
              {role === "superadmin" && (
                <DepartmentDropdown
                  instituteId={institute}
                  onSelect={handleDepartmentSelect}
                  className="w-full"
                  size="md"
                  selectedDepartment={selectedDepartment}
                />
              )}

              {/* Step 2: Select Academic Year */}
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    startContent={<Calendar className="w-4 h-4" />}
                    className="w-full"
                  >
                    {academicYear || "Select Year"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  items={getAcademicYears(10)}
                  selectedKeys={new Set([academicYear])}
                  onAction={(key) => setAcademicYear(key)}
                >
                  {(item) => (
                    <DropdownItem key={item.value}>
                      {item.label}
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>

              {/* Step 3: Select Semester */}
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered" className="w-full">
                    {selectedSemester === "sem1" ? "Semester 1" : "Semester 2"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Semester selection"
                  onAction={(key) => setSelectedSemester(key)}
                  selectedKeys={new Set([selectedSemester])}
                >
                  <DropdownItem key="sem1">Semester 1</DropdownItem>
                  <DropdownItem key="sem2">Semester 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Step 4: Select Class */}
              <ClassDropdown
                id="class-select"
                instituteId={institute}
                onSelect={handleClassSelect}
                selectedClass={selectedClass}
                acadmicYear={academicYear}
                size="md"
                className="w-full"
                selectedDepartment={selectedDepartment}
              />

              {/* Step 5: Select View Type */}
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered" className="w-full">
                    {viewType === "cumulative" ? "Cumulative View" : "Individual Subject"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={new Set([viewType])}
                  onAction={(key) => setViewType(key)}
                >
                  <DropdownItem key="cumulative">Cumulative View</DropdownItem>
                  <DropdownItem key="individual">Individual Subject</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Step 6: Select Subject (only if individual view is selected) */}
              {viewType === "individual" && (
                <SubjectDropdown
                  instituteId={institute}
                  selectedClass={selectedClass}
                  onSelect={handleSubjectSelection}
                  fetchBy="classId"
                  selectedSubject={selectedSubject}
                  className="w-full"
                />
              )}
            </div>

            {/* Action Buttons - Placed separately for better visibility */}
            <div className="flex flex-wrap gap-4 mt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  color="primary"
                  onPress={fetchAttendance}
                  isDisabled={!selectedClass || (viewType === "individual" && !selectedSubject)}
                  startContent={<RefreshCcw className="w-4 h-4" />}
                >
                  Fetch Attendance
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  color="secondary"
                  onPress={generateExcelReport}
                  isDisabled={!attendanceData?.attendance}
                  startContent={<Download className="w-4 h-4" />}
                >
                  Download Report
                </Button>
              </motion.div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                className="text-red-500 flex items-center mt-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </motion.div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {attendanceData && viewType === 'cumulative' && (
        <motion.div
          variants={itemVariants}
          className="my-6 "
        >
          <Card shadow='sm' className='p-6 '>
            <CardHeader>
              <h2 className="text-xl font-bold">Attendance Summary</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Tooltip content="Total number of students in the class">
                  <Card className="bg-blue-50">
                    <CardBody>
                      <p className="text-sm text-gray-500">Total Students</p>
                      <p className="text-2xl font-bold">{attendanceData.attendance.length}</p>
                    </CardBody>
                  </Card>
                </Tooltip>

                <Tooltip content="Average attendance percentage across all students">
                  <Card className="bg-green-50">
                    <CardBody>
                      <p className="text-sm text-gray-500">Average Attendance</p>
                      <p className="text-2xl font-bold">
                        {(attendanceData.attendance.reduce((acc, student) => acc + (student.overallPercentage || 0), 0) / attendanceData.attendance.length).toFixed(2)}%
                      </p>
                    </CardBody>
                  </Card>
                </Tooltip>

                <Tooltip content="Number of students with attendance below 75%">
                  <Card className="bg-red-50">
                    <CardBody>
                      <p className="text-sm text-gray-500">Below Threshold</p>
                      <p className="text-2xl font-bold">
                        {attendanceData.attendance.filter(student => (student.overallPercentage || 0) < 75).length}
                      </p>
                    </CardBody>
                  </Card>
                </Tooltip>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
      <motion.div variants={itemVariants}>
        <Card shadow='sm' className="w-full ">
          <CardHeader>
            <h1 className="text-2xl font-bold">Attendance Report</h1>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}

                  transition={{ duration: 0.5 }}
                >
                  <Spinner size="lg" />
                </motion.div>
              </div>
            ) : (
              <>
                {attendanceData && (
                  <>
                    {viewType === 'individual' ? (
                      <div>
                        <Card className="mb-4 shadow-sm">
                          <CardHeader>
                            <h2 className="text-xl font-bold">
                              {attendanceData.subjectInfo?.name} {attendanceData.subjectInfo?.subType === 'practical' ? '(Practical)' : '(Theory)'}
                            </h2>
                          </CardHeader>
                          <CardBody>
                            {attendanceData.subjectInfo?.subType === 'practical' || attendanceData.subjectInfo?.subType === 'tg' ? (
                              <Tabs>
                                {Object.keys(attendanceData.attendance).map((batchName) => (
                                  <Tab key={batchName} title={`Batch ${batchName}`}>
                                    {renderSummaryTable(attendanceData.attendance[batchName])}
                                  </Tab>
                                ))}
                              </Tabs>
                            ) : (
                              renderSummaryTable(attendanceData.attendance)
                            )}
                          </CardBody>
                        </Card>
                      </div>
                    ) : (
                      <div>
                        {renderAttendanceTable()}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>

    </motion.div>
  );
}