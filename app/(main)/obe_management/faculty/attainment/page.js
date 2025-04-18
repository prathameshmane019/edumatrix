// app/obe/faculty/attainment/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Chip, Progress } from '@nextui-org/react';
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '@/app/context/UserContext';
// Import a charting library if needed, e.g., Recharts
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ViewAttainmentPage() {
    const { user } = useUser();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null); // Store full subject object
    const [batches, setBatches] = useState([]); // Need to fetch batches if applicable
    const [selectedBatch, setSelectedBatch] = useState(null); // Or filter students by batch later
    const [coAttainmentData, setCoAttainmentData] = useState([]);
    const [poAttainmentData, setPoAttainmentData] = useState([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingAttainment, setIsLoadingAttainment] = useState(false);
    const [error, setError] = useState(null);

    // TODO: Implement fetchSubjects
    const fetchSubjects = useCallback(async () => { /* ... */ }, [user]);

    // TODO: Implement fetchBatchesForSubject if applicable
    const fetchBatches = useCallback(async () => {
        if (!selectedSubject) return;
        // Fetch batches associated with the subject/class
    }, [selectedSubject]);

    // TODO: Implement calculateAttainment
    const calculateAttainment = useCallback(async () => {
        if (!selectedSubject) return;
        setIsLoadingAttainment(true); setError(null);
        setCoAttainmentData([]); setPoAttainmentData([]);
        try {
            // Call CO Attainment API
            // GET /api/obe/attainment/co?subjectId=...&academicYear=...&sem=...(&batchId=...)
            const coResponse = await axios.get('/api/obe/attainment/co', { params: { /* filters */ } });
            setCoAttainmentData(coResponse.data.data || []);

            // Call PO Attainment API (might depend on CO results or be separate)
            // GET /api/obe/attainment/po?dept=...&year=...&subjectId=...(&batchId=...)
             const poResponse = await axios.get('/api/obe/attainment/po', { params: { /* filters */ } });
             setPoAttainmentData(poResponse.data.data || []);

            toast.success("Attainment calculated.");
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to calculate attainment.";
            setError(msg); toast.error(msg);
        } finally { setIsLoadingAttainment(false); }
    }, [selectedSubject, selectedBatch]); // Add selectedBatch if using batch filter

    // --- Effects ---
     useEffect(() => { fetchSubjects(); }, [fetchSubjects]);
     useEffect(() => { fetchBatches(); }, [selectedSubject]); // Fetch batches when subject changes
     // Fetch attainment automatically? Or require button click? Let's use button.

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">View Attainment Levels</h1>

            {/* Filters: Subject, Batch (optional) */}
             <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border flex flex-wrap gap-4 items-end">
                {/* Select Subject */}
                <Select label="Select Subject" /* ... */ >{/* ... */}</Select>
                {/* Optional: Select Batch */}
                <Button color="primary" onPress={calculateAttainment} isLoading={isLoadingAttainment} isDisabled={!selectedSubject || isLoadingAttainment}>
                    Calculate Attainment
                </Button>
             </div>

            {error && <Chip color="danger">{error}</Chip>}

             {isLoadingAttainment && <Spinner label="Calculating Attainment..." />}

             {/* Display CO Attainment Table */}
             {coAttainmentData.length > 0 && (
                 <div className='mb-8'>
                     <h2 className='text-xl font-semibold mb-3'>Course Outcome (CO) Attainment</h2>
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
                                <TableRow key={item.coCode}>
                                    <TableCell>{item.coCode}</TableCell>
                                    <TableCell>{item.coDescription}</TableCell>
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
                                    <TableCell className='text-xs'>{item.studentsMet}/{item.totalStudents} students scored &gt;= {item.scoreThreshold}%</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
             )}

             {/* Display PO Attainment Table/Chart */}
              {poAttainmentData.length > 0 && (
                 <div>
                     <h2 className='text-xl font-semibold mb-3'>Program Outcome (PO/PSO) Attainment</h2>
                     {/* Option 1: Table */}
                     <Table aria-label="PO Attainment Table">
                         {/* Columns: PO Code, Description, Attainment Level (%) */}
                         <TableHeader><TableColumn>Code</TableColumn><TableColumn>Level</TableColumn></TableHeader>
                         <TableBody items={poAttainmentData}>{/* ... map items ... */}</TableBody>
                     </Table>

                      {/* Option 2: Chart (requires charting library) */}
                     {/* <div style={{ height: 300 }}>
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={poAttainmentData}>
                                 <CartesianGrid strokeDasharray="3 3" />
                                 <XAxis dataKey="poCode" />
                                 <YAxis />
                                 <Tooltip />
                                 <Legend />
                                 <Bar dataKey="attainmentLevel" fill="#8884d8" name="Attainment %" />
                             </BarChart>
                         </ResponsiveContainer>
                      </div> */}
                 </div>
             )}

            {!isLoadingAttainment && coAttainmentData.length === 0 && poAttainmentData.length === 0 && selectedSubject && (
                 <p className='text-center text-gray-500 mt-10'>Click "Calculate Attainment" to view results for the selected subject.</p>
             )}


        </div>
    );
}