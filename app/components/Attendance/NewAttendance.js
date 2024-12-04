"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Button,
    Checkbox,
    CheckboxGroup,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardBody,
    CardHeader,
    Divider
} from "@nextui-org/react";
import axios from 'axios';
import { Calendar, Users, BookOpen, CheckSquare, PlusCircle, Trash2 } from 'lucide-react';
import { SubjectDropdown } from "../subject/SubjectDropdown";
import { BatchDropdown } from "../subject/BatchDropdown";

// ... (keep the MemoizedPointInput component as is)

const TGSessionContent = React.memo(({
    selectedDate,
    setSelectedDate,
    pointInputs,
    setPointInputs,
    tgSessions
}) => {
    // ... (keep the existing TGSessionContent implementation)
});

TGSessionContent.displayName = 'TGSessionContent';

const CourseContent = React.memo(({
    subjectDetails,
    selectedBatch,
    selectedContentIds,
    setSelectedContentIds
}) => {
    const handleContentSelection = useCallback((contentId) => {
        setSelectedContentIds(prev =>
            prev.includes(contentId)
                ? prev.filter(id => id !== contentId)
                : [...prev, contentId]
        );
    }, [setSelectedContentIds]);

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold">Course Content</h2>
            </CardHeader>
            <CardBody>
                <Table aria-label="Course Content Table">
                    <TableHeader>
                        <TableColumn>Select</TableColumn>
                        <TableColumn>Title</TableColumn>
                        <TableColumn>Description</TableColumn>
                        <TableColumn>Status</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {subjectDetails.content.map((content) => {
                            const batchStatus = subjectDetails.subType === 'practical'
                                ? content.batchStatus?.find(b => b.batchId === selectedBatch)
                                : null;
                            const isCovered = subjectDetails.subType === 'practical'
                                ? batchStatus?.status === 'covered'
                                : content.status === 'covered';

                            return (
                                <TableRow key={content._id}>
                                    <TableCell>
                                        <Checkbox
                                            isSelected={selectedContentIds.includes(content._id)}
                                            onChange={() => handleContentSelection(content._id)}
                                            isDisabled={isCovered}
                                        />
                                    </TableCell>
                                    <TableCell>{content.title}</TableCell>
                                    <TableCell>{content.description}</TableCell>
                                    <TableCell>
                                        {subjectDetails.subType === 'practical'
                                            ? batchStatus?.status || 'not_covered'
                                            : content.status}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );
});

CourseContent.displayName = 'CourseContent';

export default function AttendanceSystem() {
    const [selectedSubject, setSelectedSubject] = useState("");
    const [isTableVisible, setIsTableVisible] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [selectedSession, setSelectedSession] = useState([]);
    const [selectedContentIds, setSelectedContentIds] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [profile, setProfile] = useState(null);
    const [subjectDetails, setSubjectDetails] = useState(null);
    const [batches, setBatches] = useState([]);
    const [availableSessions, setAvailableSessions] = useState([]);
    const [pointInputs, setPointInputs] = useState([{ id: Date.now(), value: '' }]);
    const [tgSessions, setTgSessions] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSubjectType, setSelectedSubjectType] = useState(null)

    useEffect(() => {
        const storedProfile = sessionStorage.getItem('userProfile');
        if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
        }
    }, []);


    const resetForm = useCallback(() => {
        setSelectedBatch(null);
        setIsTableVisible(false);
        setSelectedKeys(new Set([]));
        setSelectedContentIds([]);
        setSubjectDetails(null);
        setSelectedSession([]);
        setSelectedSubject("");
        setSelectedSubjectType(null);
        setPointInputs([{ id: Date.now(), value: '' }]);
        setSelectedDate("");
        setAvailableSessions([]);
    }, []);


    const fetchAvailableSessions = useCallback(async (subjectId, batchId, date) => {
        try {
            const response = await axios.get(`/api/utils/available-sessions?subjectId=${subjectId}&batchId=${batchId || ''}&date=${date}`);
            setAvailableSessions(response.data.availableSessions);
        } catch (error) {
            console.error('Error fetching available sessions:', error);
        }
    }, []);

    const fetchSubjectDetails = useCallback(async (subjectId, batchId) => {
        try {
            const response = await axios.get(`/api/v2/utils/attendance-data?_id=${subjectId}&batchId=${batchId || ''}`);
            const { subject, batches } = response.data;
            console.log(response.data);

            setSubjectDetails(subject);
            setBatches(batches || []);
            setStudents(students || []);
            if (subject.subType === 'tg') {
                setTgSessions(subject.tgSessions || []);
                setPointInputs([{ id: Date.now(), value: '' }]);
            }
        } catch (error) {
            console.error('Error fetching subject details:', error);
        }
    }, []);

    const handleSubjectSelection = useCallback((value, type) => {
        console.log('Selected subject:', value, 'Type:', type);
        setSelectedSubject(value);
        setSelectedSubjectType(type);
        setSelectedBatch(null);
        setIsTableVisible(false);
      }, []);

    const handleBatchSelection = useCallback((value) => {
        setSelectedBatch(value);
    }, []);

    useEffect(() => {
        if (selectedSubject && selectedDate) {
            fetchSubjectDetails(selectedSubject, selectedBatch);
            fetchAvailableSessions(selectedSubject, selectedBatch, selectedDate);
        }
    }, [selectedSubject, selectedBatch, selectedDate, fetchSubjectDetails, fetchAvailableSessions]);

    const handleTakeAttendance = useCallback(() => {
        setIsTableVisible(true);
    }, []);

    // ... (keep the validateTGSession function as is)

    const submitAttendance = useCallback(async () => {
        if (!selectedSubject) {
            alert("Please select a subject");
            return;
        }

        if (selectedSession.length === 0) {
            alert("Please select at least one session");
            return;
        }

        if (subjectDetails?.subType === 'tg' && !validateTGSession()) {
            return;
        }

        const presentStudentIds = Array.from(selectedKeys).filter(key => key !== "all");

        const attendanceData = {
            subject: selectedSubject,
            session: selectedSession,
            attendanceRecords: students.map(student => ({
                student: student._id,
                status: presentStudentIds.includes(student._id) ? 'present' : 'absent'
            })),
            batchId: selectedBatch,
            date: selectedDate,
            ...(subjectDetails.subType === 'tg'
                ? {
                    pointsDiscussed: pointInputs
                        .filter(point => point.value.trim())
                        .map(point => point.value.trim())
                }
                : { contents: selectedContentIds })
        };

        try {
            const response = await axios.post('/api/attendance', attendanceData);
            alert("Attendance submitted successfully");
            if (subjectDetails.subType === 'tg') {
                await fetchSubjectDetails(selectedSubject, selectedBatch);
            }
            resetForm();
        } catch (error) {
            console.error('Failed to submit attendance:', error);
            alert("Failed to submit attendance");
        }
    }, [selectedSubject, selectedSession, subjectDetails, validateTGSession, students, selectedKeys, selectedBatch, selectedDate, pointInputs, selectedContentIds, fetchSubjectDetails, resetForm]);

    const StudentListTable = useMemo(() => {
        const sortedStudents = [...students].sort((a, b) => {
            const aNum = parseInt(a.rollNumber.replace(/\D/g, ''), 10);
            const bNum = parseInt(b.rollNumber.replace(/\D/g, ''), 10);
            return aNum - bNum;
        });

        return (
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold">Students List</h2>
                </CardHeader>
                <CardBody>
                    <Table
                        aria-label="Attendance Table"
                        selectionMode="multiple"
                        selectedKeys={selectedKeys}
                        onSelectionChange={(keys) => {
                            if (keys === "all") {
                                setSelectedKeys(new Set(students.map(student => student._id)));
                            } else {
                                setSelectedKeys(keys);
                            }
                        }}
                    >
                        <TableHeader>
                            <TableColumn>Roll Number</TableColumn>
                            <TableColumn>Name</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {sortedStudents.map((student) => (
                                <TableRow key={student._id}>
                                    <TableCell>{student.rollNumber}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        );
    }, [students, selectedKeys]);

    return (
        <div className="flex flex-col gap-4 p-4 max-w-7xl mx-auto">
            <Card>
                <CardBody>
                    <div className="flex flex-wrap gap-4 items-center">
                        <SubjectDropdown
                            facultyId={profile?._id}
                            instituteId={profile?.institute._id}
                            selectedClass={selectedClass}
                            onSelect={handleSubjectSelection}
                            selectedSubject={selectedSubject}
                            className="w-full max-w-xs"
                        />
                        {selectedSubjectType && selectedSubjectType !== "theory" && (
                            <BatchDropdown
                                facultyId={profile?._id}
                                instituteId={profile?.institute._id}
                                onSelect={handleBatchSelection}
                                selectedSubject={selectedSubject}
                                selectedBatch={selectedBatch}
                            />
                        )}
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                label="Session Date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedSession([]);
                                }}
                                variant="bordered"
                                className="max-w-xs"
                            />
                        </div>

                        <CheckboxGroup
                            orientation="horizontal"
                            label="Select Sessions"
                            value={selectedSession}
                            onChange={setSelectedSession}
                        >
                            {availableSessions.map(session => (
                                <Checkbox key={session} value={session.toString()}>
                                    {session}
                                </Checkbox>
                            ))}
                        </CheckboxGroup>

                        <Button color="primary" variant="shadow" onClick={handleTakeAttendance} startContent={<CheckSquare size={20} />}>
                            Take Attendance
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {selectedSubject && subjectDetails && isTableVisible && (
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        {subjectDetails.subType === 'tg' ? (
                            <TGSessionContent
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                                pointInputs={pointInputs}
                                setPointInputs={setPointInputs}
                                tgSessions={tgSessions}
                            />
                        ) : (
                            <CourseContent
                                subjectDetails={subjectDetails}
                                selectedBatch={selectedBatch}
                                selectedContentIds={selectedContentIds}
                                setSelectedContentIds={setSelectedContentIds}
                            />
                        )}
                    </div>
                    <div>{StudentListTable}</div>
                </div>
            )}

            {isTableVisible && selectedSubject && subjectDetails && (
                <Button
                    color="primary"
                    className="max-w-xs mx-auto"
                    variant="shadow"
                    onClick={submitAttendance}
                    size="lg"
                >
                    Submit Attendance
                </Button>
            )}
        </div>
    );
}

