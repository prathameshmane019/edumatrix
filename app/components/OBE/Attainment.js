"use client";
import React, { useState, useCallback, useMemo } from 'react';
import {
    Button,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    Chip,
    Progress,
    Card,
    CardBody,
    CardHeader,
    Tooltip
} from '@nextui-org/react';
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '@/app/context/UserContext';
import { CalendarIcon, FileSpreadsheet, Info } from 'lucide-react';
import { SubjectDropdown } from "@/app/components/subject/SubjectDropdown";
import { getAcademicYears } from "@/app/utils/acadmicYears";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { ClassDropdown } from '@/app/components/Class/ClassDropdown';
import { DepartmentDropdown } from '@/app/components/department/DepartmentDropDowns';

export default function ViewAttainmentPage() {
    const { user } = useUser();
    const [subject, setSubject] = useState(null);
    const [academicYears, setAcademicYears] = useState([]);
    const [academicYear, setAcademicYear] = useState("");
    const [filterSem, setFilterSem] = useState("");
    const [coAttainmentData, setCoAttainmentData] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [poAttainmentData, setPoAttainmentData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDept, setSelectedDept] = useState(''); 
  // State for the full subject document
  const [subjectDocument, setSubjectDocument] = useState(null);
    const handleDepartmentSelect = (departmentId) => {
        setSelectedDept(departmentId.target.value);
    };

    const handleClassSelect = (value) => setSelectedClass(value);
    // Academic year options
    const academicYearOptions = useMemo(
        () => getAcademicYears(10).map((year) => ({
            key: year.value,
            value: year.value,
            label: year.label,
        })),
        []
    );
    const handleSubjectDocChange = (fullSubjectDoc) => {
        setSubjectDocument(fullSubjectDoc);
        console.log('Full subject document:', fullSubjectDoc);
         
      };
      React.useEffect(() => {
        const years = getAcademicYears(10);
        setAcademicYears(years);
    
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        let defaultAcademicYear =
            currentMonth >= 7
                ? `${currentYear}-${currentYear + 1}`
                : `${currentYear - 1}-${currentYear}`;
        const matchingYear = years.find((y) => y.value === defaultAcademicYear);
        if (matchingYear) setAcademicYear(matchingYear.value);
    }, []);

    const handleAcademicYearChange = useCallback((keys) => {
        const selectedYear = keys.size > 0 ? Array.from(keys)[0].toString() : "";
        setAcademicYear(selectedYear);
        setSubject(null);
        setFilterSem("");
        setCoAttainmentData([]);
        setPoAttainmentData([]);
    }, []);
    const handleFilterSemChange = useCallback((keys) => {
        const selectedSem = keys.size > 0 ? Array.from(keys)[0].toString() : "";
        setFilterSem(selectedSem);
        setSubject(null);
        setCoAttainmentData([]);
        setPoAttainmentData([]);
    }, []);
    const handleSubjectChange = useCallback((selectedSubject) => {
        setSubject(selectedSubject);
        setCoAttainmentData([]);
        setPoAttainmentData([]);
    }, []);
    
    // Calculate attainment
    const calculateAttainment = useCallback(async () => {
        if (!subject && !academicYear && (!user?.institute?._id || !user._id) && (!user?.department|| !selectedDept)) {
            toast.info("Please select Academic Year, Subject, and ensure institute and department are available.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCoAttainmentData([]);
        setPoAttainmentData([]);

        try {
            // Fetch CO attainment
            const coResponse = await axios.get('/api/v2/obe/attainment/co', {
                params: {
                    subject: subject,
                    academicYear,
                    sem: filterSem || undefined,
                    instituteId: user?.institute?._id || user?._id,
                    department: user?.department || selectedDept // Assuming department has a name field (string)
                }
            });

            if (coResponse.data.success && Array.isArray(coResponse.data.data)) {
                setCoAttainmentData(coResponse.data.data);
            } else {
                toast.error("No CO attainment data found.");
            }

            // Fetch PO attainment
            const poResponse = await axios.get('/api/v2/obe/attainment/po', {
                params: {
                    subject: subject,
                    academicYear,
                    sem: filterSem || undefined,
                    department: user?.department || selectedDept,
                    instituteId: user?.institute?._id || user?._id
                }
            });

            if (poResponse.data.success && Array.isArray(poResponse.data.data)) {
                setPoAttainmentData(poResponse.data.data);
            } else {
                toast.error("No PO/PSO attainment data found.");
            }

            if (coResponse.data.success && poResponse.data.success) {
                toast.success("Attainment calculated successfully.");
            }
        } catch (err) {
            console.error("Attainment calculation error:", err);
            const msg = err.response?.data?.message || "Failed to calculate attainment.";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [subject, academicYear, filterSem, user?.institute?._id, user?.department, selectedDept, user?._id]);

    // Chart data
    const coChartData = useMemo(() => {
        return coAttainmentData.map(item => ({
            name: item.coCode,
            attainment: item.attainmentLevel,
            target: item.targetPercentage
        }));
    }, [coAttainmentData]);

    const poChartData = useMemo(() => {
        return poAttainmentData.map(item => ({
            name: item.poCode,
            attainment: item.attainmentLevel,
            target: item.targetPercentage
        }));
    }, [poAttainmentData]);

    const coPieData = useMemo(() => {
        const attained = coAttainmentData.filter(co => co.isAttained).length;
        const notAttained = coAttainmentData.length - attained;
        return [
            { name: 'Attained', value: attained, color: '#10b981' },
            { name: 'Not Attained', value: notAttained, color: '#ef4444' }
        ].filter(item => item.value > 0);
    }, [coAttainmentData]);

    // Export to Excel
    const handleExport = useCallback(() => {
        const coExportData = coAttainmentData.map(item => ({
            'CO Code': item.coCode,
            Description: item.coDescription,
            'Attainment Level (%)': item.attainmentLevel,
            'Target Met': item.isAttained ? 'Yes' : 'No',
            'Target (%)': item.targetPercentage,
            'Students Met': item.studentsMet,
            'Total Students': item.totalStudents,
            'Score Threshold (%)': item.scoreThreshold
        }));

        const poExportData = poAttainmentData.map(item => ({
            'PO/PSO Code': item.poCode,
            Description: item.description,
            'Attainment Level (%)': item.attainmentLevel,
            'Target Met': item.isAttained ? 'Yes' : 'No',
            'Target (%)': item.targetPercentage
        }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(coExportData), 'CO Attainment');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(poExportData), 'PO-PSO Attainment');
        XLSX.writeFile(wb, `attainment_${academicYear}_${subject?.name || 'report'}.xlsx`);
        toast.success("Report exported successfully.");
    }, [coAttainmentData, poAttainmentData, academicYear, subject]);

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                <CardHeader className=" ">
                    <h1 className="text-2xl font-bold text-slate-800">OBE Attainment Dashboard</h1>
                </CardHeader>
                <CardBody className="p-6">
                    {subject && academicYear && (
                        <p className="text-slate-600 text-sm">
                            Year: {academicYear} | Semester: {filterSem || "All"} | Subject: {subjectDocument?.label || subject}
                        </p>
                    )}
                    {!subject && academicYear && (
                        <p className="text-slate-600 text-sm">
                            Year: {academicYear} | Semester: {filterSem || "All"} | Please select a subject.
                        </p>
                    )}
                    {!academicYear && (
                        <p className="text-slate-600 text-sm">Select Academic Year and Subject to view attainment levels.</p>
                    )}
                </CardBody>
            </Card>

            {/* Filters */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                <CardBody className="flex  flex-col gap-4   p-6">
                    <div className="flex gap-4 items-center">
                        {user?.role === "superadmin" && (
                            <DepartmentDropdown
                                instituteId={user?.role === "superadmin" ? user?._id : user?.institute?._id}
                                onSelect={handleDepartmentSelect}
                                className="w-full sm:w-[40%] my-2 sm:my-4"
                                size='md'
                                selectedDepartment={selectedDept}
                            />)}
<Select
    placeholder="Select Academic Year"
    variant="bordered"
    selectedKeys={academicYear ? new Set([academicYear]) : new Set()}
    onSelectionChange={handleAcademicYearChange}
    startContent={<CalendarIcon size={18} className="text-indigo-600" />}
    className="max-w-xs"
    classNames={{
        trigger: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-500 transition-all duration-200",
        label: "text-slate-700 font-medium",
        value: "text-slate-900",
    }}
>
    {academicYears.map((year) => (
        <SelectItem key={year.value} value={year.value} className="text-slate-900">
            {year.label}
        </SelectItem>
    ))}
</Select>

<Select
    placeholder="Filter by Semester"
    selectedKeys={filterSem ? new Set([filterSem]) : new Set()}
    onSelectionChange={handleFilterSemChange}
    className="max-w-xs"
    variant="bordered"
    isDisabled={!academicYear}
    classNames={{
        trigger: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-500 transition-all duration-200",
        label: "text-slate-700 font-medium",
        value: "text-slate-900",
    }}
>
    <SelectItem key="sem1" value="sem1">Semester 1</SelectItem>
    <SelectItem key="sem2" value="sem2">Semester 2</SelectItem>
</Select>

<SubjectDropdown
    instituteId={user?.role === "superadmin" ? user?._id : user?.institute?._id}
    onSubjectDocChange={handleSubjectDocChange}
    department={user?.role === "superadmin" ? selectedDept : user?.id}
    academicYear={academicYear}
    onSelect={handleSubjectChange}
    facultyId={user?.role === "faculty" && user?._id}
    size='md'
    selectedSubject={subject}
    selectedClass={selectedClass}
    semester={filterSem}
    fetchBy={user?.role === "faculty" ? "facultyId" : "classId"}
    isDisabled={!academicYear || !filterSem}
    classNames={{
        base: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-500 transition-all duration-200",
        label: "text-slate-700 font-medium",
    }}
/>

                    </div>
                    <div className="flex items-center gap-4 mt-5">
                        <Button
                            color="primary"
                            onPress={calculateAttainment}
                            isLoading={isLoading}
                            isDisabled={!subject || !academicYear || isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                        >
                            Calculate Attainment
                        </Button>

                        <Button
                            color="secondary"
                            startContent={<FileSpreadsheet size={18} />}
                            onPress={handleExport}
                            isDisabled={!coAttainmentData.length && !poAttainmentData.length}
                            className="bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
                        >
                            Export Report
                        </Button>

                        {(academicYear || filterSem || subject) && (
                            <Button
                                size="sm"
                                onPress={() => {
                                    setAcademicYear("");
                                    setFilterSem("");
                                    setSubject(null);
                                    setCoAttainmentData([]);
                                    setPoAttainmentData([]);
                                }}
                                color="default"
                                variant="flat"
                                className="text-slate-600 hover:bg-slate-200 transition-colors duration-200"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>

                </CardBody>
            </Card>

            {error && (
                <Chip color="danger" className="mb-4 shadow-sm">
                    {error}
                </Chip>
            )}

            {isLoading && (
                <Card className="shadow-md">
                    <CardBody className="flex justify-center py-8">
                        <Spinner label="Calculating attainment..." color="primary" />
                    </CardBody>
                </Card>
            )}

            {/* Content */}
            {!academicYear ? (
                <p className="text-slate-600 text-center">Please select an Academic Year.</p>
            ) : !subject ? (
                <p className="text-slate-600 text-center">Please select a Subject.</p>
            ) : coAttainmentData.length === 0 && poAttainmentData.length === 0 && !isLoading ? (
                <p className="text-slate-600 text-center">Click &quot;Calculate Attainment&quot; to view results.</p>
            ) : (
                <div className="space-y-8">
                    {/* CO Attainment */}
                    {coAttainmentData.length > 0 && (
                        <Card className="shadow-lg">
                            <CardHeader className="bg-indigo-50">
                                <h2 className="text-xl font-semibold text-slate-800">Course Outcome (CO) Attainment</h2>
                                <Tooltip content="Percentage of students scoring ≥ 60% of max marks per CO. Target: 70%.">
                                    <Info size={18} className="text-indigo-600 ml-2 cursor-pointer" />
                                </Tooltip>
                            </CardHeader>
                            <CardBody className="p-6">
                                <Table
                                    aria-label="CO Attainment Table"
                                    className="mb-6"
                                    classNames={{
                                        table: "min-w-full",
                                        th: "bg-slate-100 text-slate-700 font-medium",
                                        td: "text-slate-900",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>CO Code</TableColumn>
                                        <TableColumn>Description</TableColumn>
                                        <TableColumn>Attainment Level (%)</TableColumn>
                                        <TableColumn>Target Met?</TableColumn>
                                        <TableColumn>Details</TableColumn>
                                    </TableHeader>
                                    <TableBody items={coAttainmentData}>
                                        {(item) => (
                                            <TableRow key={item.coCode}>
                                                <TableCell>{item.coCode}</TableCell>
                                                <TableCell>{item.coDescription || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Progress
                                                        aria-label="Attainment Level"
                                                        size="sm"
                                                        value={item.attainmentLevel}
                                                        color={item.isAttained ? "success" : "warning"}
                                                        showValueLabel={true}
                                                        className="max-w-xs"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip color={item.isAttained ? "success" : "danger"} variant="flat">
                                                        {item.isAttained ? "Yes" : "No"} (Target: {item.targetPercentage}%)
                                                    </Chip>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600">
                                                    {item.studentsMet}/{item.totalStudents} students scored ≥ {item.scoreThreshold}%
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="h-72">
                                        <h3 className="text-md font-medium mb-2 text-slate-700">CO Attainment vs Target</h3>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={coChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="name" stroke="#475569" />
                                                <YAxis domain={[0, 100]} stroke="#475569" />
                                                <ChartTooltip formatter={(value) => `${value}%`} />
                                                <Legend />
                                                <Bar dataKey="attainment" fill="#4f46e5" name="Attainment %" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="target" fill="#d1d5db" name="Target %" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="h-72">
                                        <h3 className="text-md font-medium mb-2 text-slate-700">CO Attainment Distribution</h3>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={coPieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {coPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip />
                                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* PO/PSO Attainment */}
                    {poAttainmentData.length > 0 && (
                        <Card className="shadow-lg">
                            <CardHeader className="bg-emerald-50">
                                <h2 className="text-xl font-semibold text-slate-800">Program Outcome (PO/PSO) Attainment</h2>
                                <Tooltip content="Weighted average of CO attainments based on correlation levels (Low=0.33, Moderate=0.67, High=1.0).">
                                    <Info size={18} className="text-emerald-600 ml-2 cursor-pointer" />
                                </Tooltip>
                            </CardHeader>
                            <CardBody className="p-6">
                                <Table
                                    aria-label="PO Attainment Table"
                                    className="mb-6"
                                    classNames={{
                                        table: "min-w-full",
                                        th: "bg-slate-100 text-slate-700 font-medium",
                                        td: "text-slate-900",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn>PO/PSO Code</TableColumn>
                                        <TableColumn>Description</TableColumn>
                                        <TableColumn>Attainment Level (%)</TableColumn>
                                        <TableColumn>Target Met?</TableColumn>
                                    </TableHeader>
                                    <TableBody items={poAttainmentData}>
                                        {(item) => (
                                            <TableRow key={item.poCode}>
                                                <TableCell>{item.poCode}</TableCell>
                                                <TableCell>{item.description || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Progress
                                                        aria-label="Attainment Level"
                                                        size="sm"
                                                        value={item.attainmentLevel}
                                                        color={item.isAttained ? "success" : "warning"}
                                                        showValueLabel={true}
                                                        className="max-w-xs"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip color={item.isAttained ? "success" : "danger"} variant="flat">
                                                        {item.isAttained ? "Yes" : "No"} (Target: {item.targetPercentage}%)
                                                    </Chip>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                <div className="h-72">
                                    <h3 className="text-md font-medium mb-2 text-slate-700">PO/PSO Attainment vs Target</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={poChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" stroke="#475569" />
                                            <YAxis domain={[0, 100]} stroke="#475569" />
                                            <ChartTooltip formatter={(value) => `${value}%`} />
                                            <Legend />
                                            <Bar dataKey="attainment" fill="#10b981" name="Attainment %" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="target" fill="#d1d5db" name="Target %" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}