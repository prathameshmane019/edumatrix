"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button,
  Checkbox,
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
  CheckboxGroup,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import axios from 'axios';
import { Calendar, Users, BookOpen, CheckSquare, PlusCircle, Trash2 } from 'lucide-react';
import { SubjectDropdown } from "../subject/SubjectDropdown";
import { BatchDropdown } from "../subject/BatchDropdown";
import Image from "next/image";
import TGSessionContent from "./TGSessionContent";
import CourseContent from "./CourseContent";

export default function UpdateAttendance() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedContentIds, setSelectedContentIds] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [batches, setBatches] = useState([]);
  const [availableSessions, setAvailableSessions] = useState([1,2,3,4,5,6,7]);
  const [pointInputs, setPointInputs] = useState([{ id: Date.now(), value: '' }]);
  const [tgSessions, setTgSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [subjectType, setSubjectType] = useState(null);
  const [attendanceRecord, setAttendanceRecord] = useState(null); // Added state for attendance record

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
    setSelectedSession(null);
    setSelectedSubject("");
    setPointInputs([{ id: Date.now(), value: '' }]);
    setSelectedDate("");
    setAttendanceRecord(null); // Reset attendance record
  }, []);



  const fetchSubjectDetails = useCallback(async (subjectId, batchId, date, session) => {
    try {
      const response = await axios.get(`/api/v2/update-attendance`, {
        params: {
          _id: subjectId,
          batchId: batchId || '',
          date,
          session
        }
      });
      console.log(response.data);
      
      const { subject, batches, students, attendanceRecord } = response.data;
      setSubjectDetails(subject);
      setBatches(batches || []);
      setStudents(students || []);
      setAttendanceRecord(attendanceRecord);
      if (attendanceRecord) {
        setSelectedKeys(new Set(attendanceRecord.records.map(r => r.status === "present" ? r.student : null).filter(Boolean)));
        setSelectedContentIds(attendanceRecord.contents || []);
        if (subject.subType === 'tg') {
          setPointInputs(attendanceRecord.pointsDiscussed.map((point, index) => ({ id: index, value: point })) || [{ id: Date.now(), value: '' }]);
        }
      } else {
        setSelectedKeys(new Set());
        setSelectedContentIds([]);
        setPointInputs([{ id: Date.now(), value: '' }]);
      }
      if (subject.subType === 'tg') {
        setTgSessions(subject.tgSessions || []);
      }
    } catch (error) {
      console.error('Error fetching subject details:', error);
    }
  }, []);

  const handleSubjectSelection = (value) => {
    setSelectedSubject(value);
    setSelectedBatch(null);
    setIsTableVisible(false);
  }

  const handleBatchSelection = useCallback((value) => {
    setSelectedBatch(value);
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedDate && selectedSession) {
      fetchSubjectDetails(selectedSubject, selectedBatch, selectedDate, selectedSession);
     }
  }, [selectedSubject, selectedBatch, selectedDate, selectedSession, fetchSubjectDetails]);

  const handleTakeAttendance = useCallback(() => {
    if (selectedSubject && selectedDate && selectedSession) {
      fetchSubjectDetails(selectedSubject, selectedBatch, selectedDate, selectedSession);
      setIsTableVisible(true);
    } else {
      alert("Please select subject, date, and session before taking attendance.");
    }
  }, [selectedSubject, selectedBatch, selectedDate, selectedSession, fetchSubjectDetails]);

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

  const updateAttendance = useCallback(async () => {
    if (!selectedSubject) {
      alert("Please select a subject");
      return;
    }

    if (!selectedSession) {
      alert("Please select a session");
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
      institute: profile?.institute._id,
      ...(subjectDetails.subType === 'tg'
        ? {
          pointsDiscussed: pointInputs
            .filter(point => point.value.trim())
            .map(point => point.value.trim())
        }
        : { contents: selectedContentIds })
    };

    try {
      const response = await axios.put('/api/attendance', attendanceData);
      alert("Attendance updated successfully");
      setAttendanceRecord(response.data); // Set the attendance record after successful update
      if (subjectDetails.subType === 'tg') {
        await fetchSubjectDetails(selectedSubject, selectedBatch, selectedDate, selectedSession);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to update attendance:', error);
      alert("Failed to update attendance");
    }
  }, [selectedSubject, selectedSession, subjectDetails, validateTGSession, students, selectedKeys, selectedBatch, selectedDate, pointInputs, selectedContentIds, profile, fetchSubjectDetails, resetForm]);

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
            onSelectionChange={setSelectedKeys}
          >
            <TableHeader>
              <TableColumn>Roll Number</TableColumn>
              <TableColumn>Name</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Checkbox
                      isSelected={selectedKeys.has(student._id)}
                      onChange={() => {
                        setSelectedKeys(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(student._id)) {
                            newSet.delete(student._id);
                          } else {
                            newSet.add(student._id);
                          }
                          return newSet;
                        });
                      }}
                    />
                  </TableCell>
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
              onSelect={handleSubjectSelection}
              selectedSubject={selectedSubject}
              onSubjectTypeChange={setSubjectType}
            />
            {subjectType !== "theory" && (
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
                  setSelectedSession(null);
                }}
                variant="bordered"
                className="max-w-xs"
              />
            </div>

            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="capitalize">
                  {selectedSession ? `Session ${selectedSession}` : "Select Session"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Session selection"
                variant="flat"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selectedSession ? new Set([selectedSession.toString()]) : new Set()}
                onSelectionChange={(keys) => setSelectedSession(Array.from(keys)[0])}
              >
                {availableSessions.map((session) => (
                  <DropdownItem key={session.toString()}>Session {session}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

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
          onClick={updateAttendance}
          size="lg"
        >
          {attendanceRecord ? 'Update Attendance' : 'Submit Attendance'}
        </Button>
      )}

      {!isTableVisible && (
        <div className="mt-8 flex flex-col items-center gap-3 ">
          <Image
            alt="No data found"
            src="/update.svg"
            width={500}
            height={500}
            className="object-contain"
          />
          <p className="text-2xl">No Students Found</p>
        </div>
      )}
    </div>
  );
}
