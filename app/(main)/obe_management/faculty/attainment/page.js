"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tooltip
} from '@nextui-org/react';
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '@/app/context/UserContext';
import { CalendarIcon } from 'lucide-react';
import { SubjectDropdown } from "@/app/components/subject/SubjectDropdown";
import { getAcademicYears } from "@/app/utils/acadmicYears";
// Import charting library if needed for visualization
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ViewAttainmentPage() {
    const { user } = useUser();
    const [subject, setSubject] = useState(null);
    const [academicYear, setAcademicYear] = useState("");
    const [filterSem, setFilterSem] = useState("");
    const [coAttainmentData, setCoAttainmentData] = useState([]);
    const [poAttainmentData, setPoAttainmentData] = useState([]);
    const [isLoadingAttainment, setIsLoadingAttainment] = useState(false);
    const [error, setError] = useState(null);

    // Academic year options
    const academicYearOptions = useMemo(
        () => getAcademicYears(10).map((year) => ({
            key: year.value,
            value: year.value,
            label: year.label,
        })),
        []
    );

    // Handle academic year change
    const handleAcademicYearChange = useCallback((keys) => {
        const selectedYear = keys.size > 0 ? Array.from(keys)[0].toString() : "";
        console.log("Academic year changed:", selectedYear);
        setAcademicYear(selectedYear);
        setSubject(null);
        setFilterSem("");
        // Clear existing data
        setCoAttainmentData([]);
        setPoAttainmentData([]);
    }, []);

    // Handle semester filter change
    const handleFilterSemChange = useCallback((keys) => {
        const selectedSem = keys.size > 0 ? Array.from(keys)[0].toString() : "";
        console.log("Semester filter changed:", selectedSem);
        setFilterSem(selectedSem);
        // Clear existing data when filter changes
        setCoAttainmentData([]);
        setPoAttainmentData([]);
    }, []);

    // Handle subject change
    const handleSubjectChange = useCallback((selectedSubject) => {
        console.log("Subject changed:", selectedSubject);
        setSubject(selectedSubject);
        // Clear existing data when subject changes
        setCoAttainmentData([]);
        setPoAttainmentData([]);
    }, []);

    // Calculate attainment levels
    const calculateAttainment = useCallback(async () => {
        if (!subject || !academicYear) {
            toast.info("Please select both Academic Year and Subject first.");
            return;
        }

        setIsLoadingAttainment(true);
        setError(null);
        setCoAttainmentData([]);
        setPoAttainmentData([]);

        try {
            // Call CO Attainment API
            const coResponse = await axios.get('/api/v2/obe/attainment/co', { 
                params: { 
                    subjectId: subject, 
                    academicYear: academicYear,
                    sem: filterSem || undefined
                } 
            });
            setCoAttainmentData(coResponse.data.data || []);

            // Call PO Attainment API
            const poResponse = await axios.get('/api/v2/obe/attainment/po', { 
                params: { 
                    subjectId: subject,
                    academicYear: academicYear,
                    sem: filterSem || undefined,
                    dept: user?.department?._id
                } 
            });
            setPoAttainmentData(poResponse.data.data || []);

            toast.success("Attainment calculated successfully.");
        } catch (err) {
            console.error("Attainment calculation error:", err);
            const msg = err.response?.data?.message || "Failed to calculate attainment.";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoadingAttainment(false);
        }
    }, [subject, academicYear, filterSem, user?.department?._id]);

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">View Attainment Levels</h1>
                {subject && academicYear && (
                    <p className="text-gray-500">
                        Year: {academicYear} | Semester: {filterSem || "All"}
                    </p>
                )}
                {!subject && academicYear && (
                    <p className="text-gray-500">
                        Year: {academicYear} | Semester: {filterSem || "All"} | Please select a subject.
                    </p>
                )}
                {!academicYear && !subject && (
                    <p className="text-gray-500">Select Academic Year and Subject to view attainment levels.</p>
                )}
            </div>

            {/* Filters: Academic Year, Semester, Subject */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border flex flex-wrap gap-4 items-end">
                {/* Academic Year Select */}
                <Select
                    placeholder="Select Academic Year"
                    variant="bordered"
                    selectedKeys={academicYear ? new Set([academicYear]) : new Set()}
                    onSelectionChange={handleAcademicYearChange}
                    startContent={<CalendarIcon size={18} className="text-indigo-600" />}
                    className="max-w-xs"
                    classNames={{
                        trigger: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all",
                        label: "text-slate-700 font-medium",
                    }}
                >
                    {academicYearOptions.map((year) => (
                        <SelectItem key={year.key} value={year.value} className="text-slate-900">
                            {year.label}
                        </SelectItem>
                    ))}
                </Select>

                {/* Semester Select */}
                <Select
                    label="Semester"
                    placeholder="Filter by Semester"
                    selectedKeys={filterSem ? new Set([filterSem]) : new Set()}
                    onSelectionChange={handleFilterSemChange}
                    className="max-w-xs"
                    isDisabled={!academicYear}
                >
                    <SelectItem key="sem1" value="sem1">
                        sem1
                    </SelectItem>
                    <SelectItem key="sem2" value="sem2">
                        sem2
                    </SelectItem>
                </Select>

                {/* Subject Dropdown */}
                <SubjectDropdown
                    instituteId={user?.institute?._id}
                    department={user?.department}
                    academicYear={academicYear}
                    onSelect={handleSubjectChange}
                    facultyId={user?._id}
                    selectedSubject={subject}
                    label="Subject"
                    semester={filterSem}
                    className="max-w-xs"
                    isDisabled={!academicYear}
                    classNames={{
                        base: "bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all",
                        label: "text-slate-700 font-medium",
                    }}
                />

                {/* Calculate Button */}
                <Button 
                    color="primary" 
                    onPress={calculateAttainment} 
                    isLoading={isLoadingAttainment} 
                    isDisabled={!subject || !academicYear || isLoadingAttainment}
                >
                    Calculate Attainment
                </Button>

                {/* Clear Filters Button */}
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
                        color="secondary"
                        variant="flat"
                    >
                        Clear Filters
                    </Button>
                )}
            </div>

            {error && (
                <Chip color="danger" className="mb-4">
                    {error}
                </Chip>
            )}

            {isLoadingAttainment && (
                <div className="flex justify-center py-8">
                    <Spinner label="Calculating Attainment..." />
                </div>
            )}

            {/* Conditional Content Based on Data */}
            {!academicYear ? (
                <p className="text-gray-500 py-8 text-center">Please select an Academic Year.</p>
            ) : !subject ? (
                <p className="text-gray-500 py-8 text-center">Please select a Subject.</p>
            ) : coAttainmentData.length === 0 && poAttainmentData.length === 0 && !isLoadingAttainment ? (
                <p className="text-center text-gray-500 mt-10">
                    Click &#34;Calculate Attainment&#34; to view results for the selected subject.
                </p>
            ) : (
                <>
                    {/* Display CO Attainment Table */}
                    {coAttainmentData.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-3">Course Outcome (CO) Attainment</h2>
                            <Table aria-label="CO Attainment Table">
                                <TableHeader>
                                    <TableColumn>CO Code</TableColumn>
                                    <TableColumn>Description</TableColumn>
                                    <TableColumn>Attainment Level (%)</TableColumn>
                                    <TableColumn>Target Met?</TableColumn>
                                    <TableColumn>Details</TableColumn>
                                </TableHeader>
                                <TableBody items={coAttainmentData}>
                                    {(item) => (
                                        <TableRow key={item.coCode || `co-${item.index}`}>
                                            <TableCell>{item.coCode || `CO${item.index}`}</TableCell>
                                            <TableCell>{item.coDescription || item.description}</TableCell>
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
                                            <TableCell className="text-xs">
                                                {item.studentsMet}/{item.totalStudents} students scored &gt;= {item.scoreThreshold}%
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Display PO Attainment Table/Chart */}
                    {poAttainmentData.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-3">Program Outcome (PO/PSO) Attainment</h2>
                            <Table aria-label="PO Attainment Table">
                                <TableHeader>
                                    <TableColumn>PO Code</TableColumn>
                                    <TableColumn>Description</TableColumn>
                                    <TableColumn>Attainment Level (%)</TableColumn>
                                    <TableColumn>Target Met?</TableColumn>
                                </TableHeader>
                                <TableBody items={poAttainmentData}>
                                    {(item) => (
                                        <TableRow key={item.poCode || `po-${item.index}`}>
                                            <TableCell>{item.poCode || `PO${item.index}`}</TableCell>
                                            <TableCell>{item.description || item.poDescription}</TableCell>
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

                            {/* Uncomment this section if you want to add a chart visualization */}
                            {/* <div className="mt-6" style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={poAttainmentData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey={item => item.poCode || `PO${item.index}`} />
                                        <YAxis domain={[0, 100]} />
                                        <ChartTooltip />
                                        <Legend />
                                        <Bar dataKey="attainmentLevel" fill="#8884d8" name="Attainment %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div> */}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}