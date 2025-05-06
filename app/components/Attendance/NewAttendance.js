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
  Divider,
  Select,
  SelectItem
} from "@nextui-org/react";
import axios from 'axios';
import { Calendar, Users, BookOpen, CheckSquare, PlusCircle, Trash2 } from 'lucide-react';
import { SubjectDropdown } from "../subject/SubjectDropdown";
import { BatchDropdown } from "../subject/BatchDropdown";
import Loader from "../loader";
import { getAcademicYears } from "@/app/utils/acadmicYears";

const MemoizedPointInput = React.memo(({ value, onChange, onRemove, canRemove, index }) => (
  <div className="flex gap-2 items-center">
    <Input
      key={`point-input-${index}`}
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
      variant="bordered"
      className="flex-grow"
      placeholder={`Point ${index + 1}`}
      aria-label={`Discussion point ${index + 1}`}
    />
    {canRemove && (
      <Button
        isIconOnly
        variant="light"
        color="danger"
        onClick={() => onRemove(index)}
        aria-label="Remove point"
      >
        <Trash2 size={20} />
      </Button>
    )}
  </div>
));

MemoizedPointInput.displayName = 'MemoizedPointInput';

const TGSessionContent = React.memo(({
  selectedDate,
  setSelectedDate,
  pointInputs,
  setPointInputs,
  tgSessions
}) => {
  const handleAddPoint = useCallback(() => {
    setPointInputs(current => [...current, { id: Date.now(), value: '' }]);
  }, [setPointInputs]);

  const handleRemovePoint = useCallback((index) => {
    setPointInputs(current => current.filter((_, i) => i !== index));
  }, [setPointInputs]);

  const handlePointChange = useCallback((index, newValue) => {
    setPointInputs(current =>
      current.map((point, i) =>
        i === index ? { ...point, value: newValue } : point
      )
    );
  }, [setPointInputs]);

  const sortedTGSessions = useMemo(() => {
    return [...tgSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [tgSessions]);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">TG Session Details</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} />
          <Input
            type="date"
            label="Session Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            variant="bordered"
            className="max-w-xs"
          />
        </div>

        <Divider />

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Points Discussed</h3>
          <div className="space-y-2">
            {pointInputs.map((point, index) => (
              <MemoizedPointInput
                key={point.id}
                value={point.value}
                onChange={handlePointChange}
                onRemove={handleRemovePoint}
                canRemove={pointInputs.length > 1}
                index={index}
              />
            ))}
          </div>
          <Button
            color="primary"
            onClick={handleAddPoint}
            className="mt-2"
            startContent={<PlusCircle size={20} />}
          >
            Add Point
          </Button>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-semibold mb-4">Previous TG Sessions</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {sortedTGSessions.length > 0 ? (
              sortedTGSessions.map((session) => (
                <Card key={session.date} className="bg-content2">
                  <CardBody>
                    <h4 className="font-medium mb-2">
                      Date: {new Date(session.date).toLocaleDateString()}
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {session.pointsDiscussed.map((point, pointIndex) => (
                        <li key={`${session.date}-point-${pointIndex}`} className="text-sm">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No previous sessions recorded</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
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
  const [subjectType, setSubjectType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');

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
    setPointInputs([{ id: Date.now(), value: '' }]);
    setSelectedDate("");
    setAvailableSessions([]);
  }, []);

  const fetchAvailableSessions = useCallback(async (subjectId, batchId, date) => {
    setIsLoading(true);

    try {
      const response = await axios.get(`/api/utils/available-sessions?subjectId=${subjectId}&batchId=${batchId || ''}&date=${date}`);
      setAvailableSessions(response.data.availableSessions);
    } catch (error) {
      console.error('Error fetching available sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSubjectDetails = useCallback(async (subjectId, batchId) => {
    setIsLoading(true);

    try {
      const response = await axios.get(`/api/v2/utils/attendance-data?_id=${subjectId}&batchId=${batchId || ''}`);
      const { subject, batches, students } = response.data;

      setSubjectDetails(subject);
      setBatches(batches || []);

      // Map student objects to match the expected structure
      const mappedStudents = students.map(student => ({
        _id: student._id,
        name: student.personalDetails?.name || student.name,
        rollNumber: student.academicDetails?.rollNumber || student.rollNumber
      }));

      setStudents(mappedStudents);

      if (subject.subType === 'tg') {
        setTgSessions(subject.tgSessions || []);
        setPointInputs([{ id: Date.now(), value: '' }]);
      }
    } catch (error) {
      console.error('Error fetching subject details:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubjectSelection = (value) => {
    setSelectedSubject(value);
    setSelectedBatch(null);
    setIsTableVisible(false);
  };

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

  const validateTGSession = useCallback(() => {
    if (!selectedDate) {
      alert("Please select a date for the TG session");
      return false;
    }

    const existingSession = tgSessions.find(session =>
      new Date(session.date).toISOString().split('T')[0] === selectedDate
    );

    if (existingSession) {
      alert("A TG session already exists for this date");
      return false;
    }

    const validPoints = pointInputs.filter(point => point.value.trim());
    if (validPoints.length === 0) {
      alert("Please add at least one point discussed");
      return false;
    }

    return true;
  }, [selectedDate, tgSessions, pointInputs]);

  const submitAttendance = useCallback(async () => {
    setIsLoading(true);

    if (!selectedSubject) {
      alert("Please select a subject");
      setIsLoading(false);
      return;
    }

    if (selectedSession.length === 0) {
      alert("Please select at least one session");
      setIsLoading(false);
      return;
    }

    if (subjectDetails?.subType === 'tg' && !validateTGSession()) {
      setIsLoading(false);
      return;
    }

    const presentStudentIds = Array.from(selectedKeys).filter(key => key !== "all");

    // Prepare attendance records with proper structure
    const attendanceRecords = students.map(student => ({
      student: student._id,
      status: presentStudentIds.includes(student._id) ? 'present' : 'absent'
    }));

    // Prepare points discussed array from pointInputs
    const pointsDiscussedArray = subjectDetails?.subType === 'tg'
      ? pointInputs.filter(point => point.value.trim()).map(point => point.value.trim())
      : undefined;

    // Create attendance data object
    const attendanceData = {
      subject: selectedSubject,
      session: selectedSession,
      attendanceRecords: attendanceRecords,
      date: selectedDate,
      institute: profile?.institute._id,
      ...(selectedBatch && { batchId: selectedBatch }),
      ...(subjectDetails?.subType === 'tg' && { pointsDiscussed: pointsDiscussedArray }),
      ...(subjectDetails?.subType !== 'tg' && { contents: selectedContentIds })
    };

    try {
      console.log("Sending attendance data:", attendanceData);
      const response = await axios.post('/api/v2/attendance', attendanceData);
      alert("Attendance submitted successfully");

      if (subjectDetails?.subType === 'tg') {
        await fetchSubjectDetails(selectedSubject, selectedBatch);
      }

      resetForm();
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      alert("Failed to submit attendance" + (error.response?.data?.details ? `: ${error.response.data.details}` : ""));
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, selectedSession, subjectDetails, validateTGSession, students, selectedKeys, selectedBatch, selectedDate, pointInputs, selectedContentIds, fetchSubjectDetails, resetForm, profile]);

  const StudentListTable = useMemo(() => {
    const sortedStudents = [...students].sort((a, b) => {
      const aNum = parseInt(a.rollNumber?.replace(/\D/g, '') || '0', 10);
      const bNum = parseInt(b.rollNumber?.replace(/\D/g, '') || '0', 10);
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
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
          <Loader />
        </div>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm mb-6">
        <CardHeader className="flex justify-between">

          <h2 className="text-xl font-bold">Take Attendance</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4 items-center"> 
            <Select
              placeholder="Select Academic Year"
              variant="bordered"
              size="md"
              selectedKeys={selectedYear ? [selectedYear] : []}
              onSelectionChange={(keys) => setSelectedYear(Array.from(keys)[0])}
              startContent={<Calendar className="w-4 h-4 text-default-400" />}
              className=" sm:w-[40%] my-2 sm:my-4"
            >
              {getAcademicYears(10).map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </Select>
            <SubjectDropdown
              facultyId={profile?._id}
              instituteId={profile?.institute._id}
              onSelect={handleSubjectSelection}
              selectedSubject={selectedSubject}
              academicYear={selectedYear}
              size="md"
              onSubjectTypeChange={setSubjectType}
            />
            {selectedSubject && subjectType !== "theory" && (
              <BatchDropdown
                facultyId={profile?._id}
                instituteId={profile?.institute._id}
                onSelect={handleBatchSelection}
                selectedSubject={selectedSubject}
                size="md"
                selectedBatch={selectedBatch}
              />
            )}

            <div className="flex items-center gap-2">
              <Input
                type="date"
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
            <Button color="primary" variant="flat" onClick={handleTakeAttendance} startContent={<CheckSquare size={20} />}>
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