"use client";
import React, { useState, useCallback, useMemo } from 'react';
import {
    Button, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Spinner, Chip, Progress, Card, CardBody, CardHeader, Tooltip, Tabs, Tab, Input, Slider
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
    const [academicYear, setAcademicYear] = useState("");
    const [filterSem, setFilterSem] = useState("");
    const [coAttainmentData, setCoAttainmentData] = useState([]);
    const [poAttainmentData, setPoAttainmentData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [subjectDocument, setSubjectDocument] = useState(null);
    const [coThreshold, setCoThreshold] = useState(60); // Default CO threshold
    const [coTarget, setCoTarget] = useState(70); // Default CO target

    // Memoized academic year options
    const academicYearOptions = useMemo(() => getAcademicYears(10).map(year => ({
        key: year.value,
        value: year.value,
        label: year.label,
    })), []);

    // Set default academic year
    React.useEffect(() => {
        const years = getAcademicYears(10);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const defaultAcademicYear = currentMonth >= 7
            ? `${currentYear}-${currentYear + 1}`
            : `${currentYear - 1}-${currentYear}`;
        const matchingYear = years.find(y => y.value === defaultAcademicYear);
        if (matchingYear) setAcademicYear(matchingYear.value);
    }, []);

    // Handlers
    const handleDepartmentSelect = (departmentId) => setSelectedDept(departmentId.target.value);
    const handleClassSelect = (value) => setSelectedClass(value);
    const handleSubjectDocChange = (fullSubjectDoc) => setSubjectDocument(fullSubjectDoc);
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
        if (!subject && !academicYear && (!user?.institute?._id || !user?._id) && (!user?.department || !selectedDept)) {
            toast.info("Please select Academic Year, Subject, and ensure institute and department are available.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCoAttainmentData([]);
        setPoAttainmentData([]);

        try {
            // Fetch CO and PO attainment concurrently
            const [coResponse, poResponse] = await Promise.all([
                axios.get('/api/v2/obe/attainment/co', {
                    params: {
                        subject,
                        academicYear,
                        sem: filterSem || undefined,
                        instituteId: user?.institute?._id || user?._id,
                        department: user?.department || selectedDept,
                        coThreshold,
                        coTarget
                    }
                }),
                axios.get('/api/v2/obe/attainment/po', {
                    params: {
                        subject,
                        academicYear,
                        sem: filterSem || undefined,
                        department: user?.department || selectedDept,
                        instituteId: user?.institute?._id || user?._id,
                        coThreshold,
                        coTarget
                    }
                })
            ]);

            if (coResponse.data.success && Array.isArray(coResponse.data.data)) {
                setCoAttainmentData(coResponse.data.data);
            } else {
                toast.error("No CO attainment data found.");
            }

            if (poResponse.data.success && Array.isArray(poResponse.data.data)) {
                setPoAttainmentData(poResponse.data.data);
            } else {
                toast.error("No PO/PSO attainment data found.");
            }

            if (coResponse.data.success || poResponse.data.success) {
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
    }, [subject, academicYear, filterSem, user, selectedDept, coThreshold, coTarget]);

    // Chart data
    const coChartData = useMemo(() => coAttainmentData.map(item => ({
        name: item.coCode,
        attainment: item.attainmentLevel,
        target: item.targetPercentage
    })), [coAttainmentData]);

    const poChartData = useMemo(() => poAttainmentData.map(item => ({
        name: item.poCode,
        attainment: item.attainmentLevel,
        target: item.targetPercentage
    })), [poAttainmentData]);

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
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
            {/* Header Card */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                <CardHeader className="bg-indigo-50">
                    <h1 className="text-2xl font-bold text-slate-800">OBE Attainment Dashboard</h1>
                </CardHeader>
                <CardBody className="p-6">
                    <p className="text-slate-600 text-sm">
                        {academicYear && `Year: ${academicYear} | `}
                        {filterSem && `Semester: ${filterSem} | `}
                        {subject ? `Subject: ${subjectDocument?.label || subject}` : 'Please select a subject.'}
                    </p>
                </CardBody>
            </Card>

            {/* Filters Card */}
            <Card className="mb-6 bg-white shadow-md border border-slate-200">
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 items-center md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {user?.role === "superadmin" && (
                            <DepartmentDropdown
                                instituteId={user?._id || user?.institute?._id}
                                onSelect={handleDepartmentSelect}
                                selectedDepartment={selectedDept}
                                size='md'
                                className="w-full"
                            />
                        )}
                        <Select
                            placeholder="Select Academic Year"
                            variant="bordered"
                            selectedKeys={academicYear ? new Set([academicYear]) : new Set()}
                            onSelectionChange={handleAcademicYearChange}
                            startContent={<CalendarIcon size={18} className="text-indigo-600" />}
                            className="w-full"
                        >
                            {academicYearOptions.map((year) => (
                                <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                            ))}
                        </Select>
                        {user?.role !== 'faculty' && (
                            <ClassDropdown
                                instituteId={user?._id || user?.institute?._id}
                                onSelect={handleClassSelect}
                                selectedClass={selectedClass}
                                selectedDepartment={selectedDept}
                                acadmicYear={academicYear}
                                className="w-full"
                                size='md'
                            />
                        )}
                        <Select
                            placeholder="Filter by Semester"
                            selectedKeys={filterSem ? new Set([filterSem]) : new Set()}
                            onSelectionChange={handleFilterSemChange}
                            variant="bordered"
                            isDisabled={!academicYear}
                            className="w-full"
                        >
                            <SelectItem key="sem1" value="sem1">Semester 1</SelectItem>
                            <SelectItem key="sem2" value="sem2">Semester 2</SelectItem>
                        </Select>
                        <SubjectDropdown
                            instituteId={user?.role === "superadmin" ? user?._id : user?.institute?._id}
                            onSubjectDocChange={handleSubjectDocChange}
                            department={user?.role === "superadmin" ? selectedDept : user?.role==="admin" ? user?.id:undefined}
                            academicYear={academicYear}
                            onSelect={handleSubjectChange}
                            facultyId={((user?.role === "faculty") && filterSem ) && user?._id}
                            selectedSubject={subject}
                            selectedClass={selectedClass}
                            size='md'
                            semester={filterSem}
                            fetchBy={user?.role === "faculty" ? "facultyId" : "classId"}
                            isDisabled={!academicYear || !filterSem}
                            className="w-full"
                        />
                        <div>
                            <label className="text-sm font-medium text-slate-700">CO Score Threshold (%) : {coThreshold}</label>
                            <Slider
                                aria-label="CO Threshold"
                                showTooltip={true}
                                value={coThreshold}
                                onChange={setCoThreshold}
                                min={0}
                                max={100}
                                step={1}
                                color="primary"
                                showValue
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">CO Target Percentage (%) : {coTarget} </label>
                            <Slider
                                aria-label="CO Target"
                                value={coTarget}
                                onChange={setCoTarget}
                                min={0}
                                max={100}
                                step={1}
                                showTooltip={true}
                                color="primary"
                                showValue
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            color="primary"
                            onPress={calculateAttainment}
                            isLoading={isLoading}
                            isDisabled={!subject || !academicYear || isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            Calculate Attainment
                        </Button>
                        <Button
                            color="secondary"
                            startContent={<FileSpreadsheet size={18} />}
                            onPress={handleExport}
                            isDisabled={!coAttainmentData.length && !poAttainmentData.length}
                            className="bg-emerald-600 hover:bg-emerald-700"
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
                                    setCoThreshold(60);
                                    setCoTarget(70);
                                }}
                                color="default"
                                variant="flat"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>
            {/* Error and Loading States */}
            {error && (
                <Chip color="danger" className="mb-4">{error}</Chip>
            )}
            {isLoading && (
                <Card className="shadow-md">
                    <CardBody className="flex justify-center py-8">
                        <Spinner label="Calculating attainment..." color="primary" />
                    </CardBody>
                </Card>
            )}

            {/* Tabs for CO and PO/PSO Attainment */}
            {!isLoading && (coAttainmentData.length > 0 || poAttainmentData.length > 0) && (
                <Tabs aria-label="Attainment Tabs" color="primary" variant="bordered" className="mb-6">
                    <Tab key="co" title="Course Outcomes (CO)">
                        <Card className="shadow-md">
                            <CardHeader className="bg-indigo-50">
                                <h2 className="text-xl font-semibold text-slate-800">Course Outcome (CO) Attainment</h2>
                                <Tooltip content={`Percentage of students scoring ≥ ${coThreshold}% of max marks per CO. Target: ${coTarget}%.`}>
                                    <Info size={18} className="text-indigo-600 ml-2 cursor-pointer" />
                                </Tooltip>
                            </CardHeader>
                            <CardBody className="p-6">
                                <Table aria-label="CO Attainment Table" className="mb-6">
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
                                                        showValueLabel
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
                                    <div className="h-64">
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
                                    <div className="h-64">
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
                    </Tab>
                    <Tab key="po" title="Program Outcomes (PO/PSO)">
                        <Card className="shadow-md">
                            <CardHeader className="bg-emerald-50">
                                <h2 className="text-xl font-semibold text-slate-800">Program Outcome (PO/PSO) Attainment</h2>
                                <Tooltip content={`Weighted average of CO attainments based on correlation levels. Target: ${coTarget}%.`}>
                                    <Info size={18} className="text-emerald-600 ml-2 cursor-pointer" />
                                </Tooltip>
                            </CardHeader>
                            <CardBody className="p-6">
                                <Table aria-label="PO Attainment Table" className="mb-6">
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
                                                        showValueLabel
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
                                <div className="h-64">
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
                    </Tab>
                </Tabs>
            )}

            {/* Empty State */}
            {!isLoading && !coAttainmentData.length && !poAttainmentData.length && academicYear && subject && (
                <p className="text-slate-600 text-center">Click &#34;Calculate Attainment&#34; to view results.</p>
            )}
            {!academicYear && (
                <p className="text-slate-600 text-center">Please select an Academic Year.</p>
            )}
        </div>
    );
}