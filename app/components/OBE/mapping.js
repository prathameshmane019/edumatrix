'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
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
  Tooltip,
  Divider
} from "@nextui-org/react";
import { 
  Calendar, 
  HelpCircle, 
  BookOpen, 
  Save, 
  RefreshCw, 
  Info 
} from "lucide-react";
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import { getAcademicYears } from '@/app/utils/acadmicYears';
import { SubjectDropdown } from '../subject/SubjectDropdown';
import { toast } from 'sonner';

// Correlation level details with descriptions
const CORRELATION_LEVELS = [
  { value: 0, label: "N/A", color: "default", description: "No correlation" },
  { value: 1, label: "1", color: "warning", description: "Slight correlation" },
  { value: 2, label: "2", color: "primary", description: "Moderate correlation" },
  { value: 3, label: "3", color: "success", description: "Strong correlation" }
];

// Cognitive levels with colors
const COGNITIVE_LEVELS = {
  'Remember': 'default',
  'Understand': 'primary',
  'Apply': 'secondary',
  'Analyze': 'warning',
  'Evaluate': 'success',
  'Create': 'danger',
  'N/A': 'default'
};

const MappingPage = () => {
  const { user } = useUser();
  const [academicYear, setAcademicYear] = useState('');
  const [subject, setSubject] = useState('');
  const [mappingData, setMappingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMappings, setLocalMappings] = useState({});
  const [courseOutcomeId, setCourseOutcomeId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const canLoad = user && academicYear && subject;

  useEffect(() => {
    if (canLoad) fetchMappingData();
    else {
      setMappingData(null);
      setLocalMappings({});
      setCourseOutcomeId(null);
      setHasChanges(false);
    }
  }, [academicYear, subject, user]);

  const fetchMappingData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/v2/obe/co-po-mapping', {
        params: {
          subject,
          academicYear,
          instituteId: user?.institute?._id,
          department: user?.department,
        },
      });
      
      const data = res.data?.data;
      if (!data) throw new Error("No mapping data returned");

      setMappingData(data);
      setCourseOutcomeId(data.courseOutcomeId);
      initLocalMappings(data);
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch mapping data");
    } finally {
      setIsLoading(false);
    }
  };

  const initLocalMappings = (data) => {
    const mappings = {};
    data.mappings?.forEach(({ courseOutcomeId, programOutcomeId, correlationLevel }) => {
      if (!mappings[courseOutcomeId]) mappings[courseOutcomeId] = {};
      mappings[courseOutcomeId][programOutcomeId] = correlationLevel;
    });
    setLocalMappings(mappings);
  };

  const updateMapping = (coId, poId, level) => {
    setLocalMappings(prev => ({
      ...prev,
      [coId]: {
        ...prev[coId],
        [poId]: level
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        matrixData: mappingData.courseOutcomes.map(co => {
          const mappings = [];
          const coMappings = localMappings[co.id] || {};

          [...mappingData.programOutcomes.pos, ...mappingData.programOutcomes.psos].forEach(outcome => {
            mappings.push({
              programOutcomeId: outcome.id,
              correlationLevel: coMappings[outcome.id] || 0,
            });
          });

          return { courseOutcomeId: co.id, mappings };
        }),
        courseOutcomeId
      };

      await axios.put('/api/v2/obe/co-po-mapping', payload);
      toast.success("Mappings saved successfully!");
      setHasChanges(false);
      fetchMappingData(); // refresh
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save mappings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCellBackgroundColor = (level) => {
    switch(level) {
      case 1: return "bg-amber-100 dark:bg-amber-900/30";
      case 2: return "bg-blue-100 dark:bg-blue-900/30";
      case 3: return "bg-green-100 dark:bg-green-900/30";
      default: return "";
    }
  };

  return (
    <div className="gap-4 flex flex-col p-4">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-2">
            <BookOpen size={20} />
            <h2 className="text-xl font-bold">CO-PO/PSO Mapping Matrix</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip content="Correlation levels: 1=Slight, 2=Moderate, 3=Strong">
              <Button isIconOnly variant="light" size="sm">
                <HelpCircle size={18} />
              </Button>
            </Tooltip>
          </div>
        </CardHeader>
        
        <Divider />
        
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Select
              placeholder="Select Academic Year"
              variant="bordered"
              selectedKeys={academicYear ? [academicYear] : []}
              onSelectionChange={(keys) => setAcademicYear(Array.from(keys)[0])}
              startContent={<Calendar size={16} />}
               
            >
              {getAcademicYears(10).map(year => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </Select>

            <SubjectDropdown
              instituteId={user?.institute?._id}
              department={user?.department}
              academicYear={academicYear}
              onSelect={setSubject}
              facultyId={user?._id}
              selectedSubject={subject}
              label="Subject"
            />

            <Button
              color="primary"
              onClick={fetchMappingData}
              isDisabled={!canLoad}
              isLoading={isLoading}
              startContent={<RefreshCw size={16} />}
            >
              Load Data
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Spinner size="lg" />
            </div>
          )}

          {mappingData && mappingData.courseOutcomes?.length > 0 && (
            <div className="overflow-x-auto">
              <Table 
                isStriped 
                removeWrapper 
                aria-label="CO-PO/PSO Mapping Matrix"
                classNames={{
                  th: "bg-default-100 text-center",
                  td: "text-center"
                }}
              >
                <TableHeader>
                  <TableColumn className="min-w-[250px]">Course Outcome</TableColumn>
                  {mappingData.programOutcomes.pos.map(po => (
                    <TableColumn key={po.id}>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">PO{po.index}</span>
                        <Tooltip content={po.description}>
                          <span><Info size={14} className="cursor-help mt-1" /></span>
                        </Tooltip>
                      </div>
                    </TableColumn>
                  ))}
                  {mappingData.programOutcomes.psos.map(pso => (
                    <TableColumn key={pso.id}>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">PSO{pso.index}</span>
                        <Tooltip content={pso.description}>
                          <span><Info size={14} className="cursor-help mt-1" /></span>
                        </Tooltip>
                      </div>
                    </TableColumn>
                  ))}
                </TableHeader>
                <TableBody>
                  {mappingData.courseOutcomes.map(co => (
                    <TableRow key={co.id}>
                      <TableCell>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{co.code}</span>
                            <Chip 
                              size="sm" 
                              color={COGNITIVE_LEVELS[co.cognitiveLevel] || "default"}
                            >
                              {co.cognitiveLevel}
                            </Chip>
                          </div>
                          <p className="text-sm mt-1">{co.description}</p>
                        </div>
                      </TableCell>
                      {[...mappingData.programOutcomes.pos, ...mappingData.programOutcomes.psos].map(outcome => {
                        const correlationLevel = localMappings[co.id]?.[outcome.id] || 0;
                        return (
                          <TableCell 
                            key={`${co.id}-${outcome.id}`}
                            className={getCellBackgroundColor(correlationLevel)}
                          >
                            <Select
                              size="sm"
                              aria-label={`Set correlation between ${co.code} and ${outcome.type}${outcome.index}`}
                              selectedKeys={[correlationLevel.toString()]}
                              onSelectionChange={(keys) =>
                                updateMapping(co.id, outcome.id, parseInt(Array.from(keys)[0]))
                              }
                              classNames={{
                                trigger: "min-h-0 h-8 py-0",
                              }}
                            >
                              {CORRELATION_LEVELS.map(level => (
                                <SelectItem key={level.value.toString()} value={level.value.toString()}>
                                  <span className="flex gap-2 items-center">
                                    {level.value > 0 && 
                                      <Chip size="sm" color={level.color}>{level.label}</Chip>
                                    }
                                    {level.value === 0 ? "N/A" : level.description}
                                  </span>
                                </SelectItem>
                              ))}
                            </Select>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-end">
                <Button
                  color="primary"
                  onClick={handleSave}
                  isLoading={isSubmitting}
                  startContent={<Save size={16} />}
                  isDisabled={!hasChanges}
                >
                  Save Mappings
                </Button>
              </div>
            </div>
          )}

          {!isLoading && (!subject || !academicYear) && (
            <div className="text-default-500 mt-4 p-8 text-center border border-dashed rounded-md">
              <BookOpen size={40} className="mx-auto mb-4 opacity-50" />
              <p>Please select an academic year and subject to view mappings.</p>
            </div>
          )}

          {!isLoading && mappingData?.courseOutcomes?.length === 0 && (
            <div className="text-default-500 mt-4 p-8 text-center border border-dashed rounded-md">
              <Info size={40} className="mx-auto mb-4 opacity-50" />  
              <p>No course outcomes found for selected subject and year.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default MappingPage;