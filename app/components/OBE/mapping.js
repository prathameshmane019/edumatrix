'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  useDisclosure,
  Spinner,
  Chip,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Tabs,
  Tab,
  Progress,
  Input,
} from '@nextui-org/react';

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";

import {
  Calendar,
  HelpCircle,
  BookOpen,
  Save,
  RefreshCw,
  Info,
  BarChart2,
  Filter,
  Download,
  Edit,
  Plus,
} from 'lucide-react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import { getAcademicYears } from '@/app/utils/acadmicYears';
import { SubjectDropdown } from '../subject/SubjectDropdown';
import { toast } from 'sonner';
import Chart from 'chart.js/auto';
import { debounce } from 'lodash';
import { motion } from 'framer-motion';
import { CORRELATION_LEVELS, COGNITIVE_LEVELS, initializeLocalMappings, calculateStats, downloadMapping } from './MappingUtils';

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
  const [activeFilter, setActiveFilter] = useState('all');
  const [correlationFilter, setCorrelationFilter] = useState('all');
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [justification, setJustification] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState('matrix');
  const [stats, setStats] = useState(null);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  const canLoad = user && academicYear && subject;

  const fetchMappingData = useCallback(async () => {
    if (!canLoad) return;
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
      if (!data) throw new Error('No mapping data returned');
      setMappingData(data);
      setCourseOutcomeId(data.courseOutcomeId);
      initializeLocalMappings(data, setLocalMappings);
      calculateStats(data, setStats);
      setHasChanges(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch mapping data');
    } finally {
      setIsLoading(false);
    }
  }, [academicYear, subject, user]);

  useEffect(() => {
    fetchMappingData();
  }, [fetchMappingData]);

  const updateMapping = useCallback(
    debounce((coId, poId, level) => {
      setLocalMappings((prev) => {
        const currentMapping = prev[coId]?.[poId] || { level: 0, justification: '' };
        return {
          ...prev,
          [coId]: {
            ...prev[coId],
            [poId]: { ...currentMapping, level },
          },
        };
      });
      setHasChanges(true);
    }, 300),
    []
  );

  const editJustification = (coId, poId) => {
    const mapping = localMappings[coId]?.[poId];
    if (!mapping || mapping.level === 0) return;
    setSelectedMapping({ coId, poId });
    setJustification(mapping.justification || '');
    onOpen();
  };

  const saveJustification = () => {
    if (!selectedMapping) return;
    const { coId, poId } = selectedMapping;
    setLocalMappings((prev) => {
      const updatedMappings = {
        ...prev,
        [coId]: {
          ...prev[coId],
          [poId]: { ...prev[coId]?.[poId], justification },
        },
      };
      return updatedMappings;
    });
    setHasChanges(true);
    setSelectedMapping(null);
    setJustification('');
    onClose();
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const mappings = [];
      mappingData.courseOutcomes.forEach((co) => {
        const coMappings = localMappings[co.id] || {};
        [...mappingData.programOutcomes.pos, ...mappingData.programOutcomes.psos].forEach((outcome) => {
          const mapping = coMappings[`${outcome.type}-${outcome.id}`] || { level: 0, justification: '' };
          if (mapping.level > 0) {
            mappings.push({
              courseOutcomeId: co.id,
              programOutcomeId: outcome.id,
              outcomeType: outcome.type,
              correlationLevel: mapping.level,
              justification: mapping.justification || '',
            });
          }
        });
      });
      const payload = { courseOutcomeId, userId: user?._id, mappings };
      await axios.put('/api/v2/obe/co-po-mapping', payload);
      toast.success('Mappings saved successfully!');
      setHasChanges(false);
      calculateStats(mappingData, setStats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save mappings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourseOutcomes = useMemo(() => {
    if (!mappingData) return [];
    return mappingData.courseOutcomes.filter((co) => {
      if (correlationFilter !== 'all') {
        const coMappings = localMappings[co.id] || {};
        return Object.values(coMappings).some((m) => m.level === parseInt(correlationFilter));
      }
      return true;
    });
  }, [mappingData, correlationFilter, localMappings]);

  const filteredProgramOutcomes = useMemo(() => {
    if (!mappingData) return { pos: [], psos: [] };
    if (activeFilter === 'po') return { pos: mappingData.programOutcomes.pos, psos: [] };
    if (activeFilter === 'pso') return { pos: [], psos: mappingData.programOutcomes.psos };
    return mappingData.programOutcomes;
  }, [mappingData, activeFilter]);

  useEffect(() => {
    if (activeTab === 'stats' && stats && mappingData && chartRef.current) {
      if (chartInstance) chartInstance.destroy();
      const newChart = new Chart(chartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Level 1', 'Level 2', 'Level 3'],
          datasets: [
            {
              data: [stats.byLevel[1] || 0, stats.byLevel[2] || 0, stats.byLevel[3] || 0],
              backgroundColor: ['#facc15', '#3b82f6', '#10b981'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top', labels: { color: '#1e293b' } },
            tooltip: { backgroundColor: '#ffffff', bodyColor: '#1e293b', borderColor: '#e2e8f0' },
          },
        },
      });
      setChartInstance(newChart);
    }
    return () => {
      if (chartInstance) chartInstance.destroy();
    };
  }, [activeTab, stats, mappingData]);

  const getCellBackground = (level) => {
    switch (level) {
      case 1: return 'bg-yellow-50';
      case 2: return 'bg-blue-50';
      case 3: return 'bg-emerald-50';
      default: return 'bg-gray-100';
    }
  };

  const getDisplayText = () => {
    if (correlationFilter === "all") return "All Correlations";

    const selectedLevel = CORRELATION_LEVELS.find(
      level => level.value.toString() === correlationFilter.toString()
    );

    return selectedLevel
      ? `${selectedLevel.label} - ${selectedLevel.description}`
      : "Select Correlation";
  };
  // Calculate total columns dynamically
  const totalColumns = useMemo(() => {
    if (!filteredProgramOutcomes) return 1;
    return 1 + filteredProgramOutcomes.pos.length + filteredProgramOutcomes.psos.length;
  }, [filteredProgramOutcomes]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <Card className="shadow-lg border border-slate-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-800 p-6">
            <div className="flex justify-between w-full items-center">
              <div className="flex items-center gap-4">
                <BookOpen size={28} className="text-white" />
                <h1 className="text-2xl font-semibold">CO-PO/PSO Mapping Matrix</h1>
              </div>
              <Tooltip content="Learn how to map Course Outcomes to Program Outcomes">
                <Button isIconOnly variant="light" size="sm" className="text-white">
                  <HelpCircle size={20} />
                </Button>
              </Tooltip>
            </div>
          </CardHeader>
          <CardBody className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                placeholder="Select Academic Year"
                variant="bordered"
                selectedKeys={academicYear ? [academicYear] : []}
                onSelectionChange={(keys) => setAcademicYear(Array.from(keys)[0])}
                startContent={<Calendar size={18} className="text-indigo-600" />}
                classNames={{
                  trigger: 'bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all',
                  label: 'text-slate-700 font-medium',
                }}
              >
                {getAcademicYears(10).map((year) => (
                  <SelectItem key={year.value} value={year.value} className="text-slate-900">
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
                classNames={{
                  base: 'bg-white border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 transition-all',
                  label: 'text-slate-700 font-medium',
                }}
              />
              <div className="flex gap-3">
                <Button
                  color="primary"
                  onClick={fetchMappingData}
                  isDisabled={!canLoad}
                  isLoading={isLoading}
                  className="w-full  text-white hover:bg-indigo-700 transition-all shadow-md rounded-lg"
                  startContent={<RefreshCw size={18} />}
                >
                  Load Data
                </Button>
                {mappingData && (
                  <Button
                    isIconOnly
                    variant="flat"
                    color="secondary"
                    onClick={() => downloadMapping(mappingData, localMappings, subject, academicYear)}
                    className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg shadow-sm"
                    title="Download as CSV"
                  >
                    <Download size={18} />
                  </Button>
                )}
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" color="primary" />
              </div>
            )}

            {mappingData && mappingData.courseOutcomes?.length > 0 && (
              <>
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  className="border-b border-slate-200"
                  variant="underlined"
                  color="primary"
                >
                  <Tab
                    key="matrix"
                    title={
                      <div className="flex items-center gap-2 text-slate-700">
                        <BookOpen size={18} />
                        <span>Mapping Matrix</span>
                      </div>
                    }
                  />
                  <Tab
                    key="stats"
                    title={
                      <div className="flex items-center gap-2 text-slate-700">
                        <BarChart2 size={18} />
                        <span>Statistics</span>
                      </div>
                    }
                  />
                </Tabs>

                {activeTab === 'matrix' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">

                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            size="sm"
                            className="w-48 bg-white border-slate-200 rounded-lg hover:border-indigo-400 transition-all"
                            startContent={<Filter size={14} className="text-indigo-600" />}
                          >
                            {activeFilter === "all"
                              ? "All Outcomes"
                              : activeFilter === "po"
                                ? "Program Outcomes"
                                : "Program Specific"}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Outcome Type"
                          onAction={(key) => setActiveFilter(key)}
                          selectedKeys={new Set([activeFilter])}
                        >
                          <DropdownItem key="all">All Outcomes</DropdownItem>
                          <DropdownItem key="po">Program Outcomes</DropdownItem>
                          <DropdownItem key="pso">Program Specific</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>

                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            className="w-48 bg-white border-slate-200 rounded-lg hover:border-indigo-400 transition-all"
                            size="sm"
                          >
                            {getDisplayText()}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Correlation Levels"
                          onAction={(key) => setCorrelationFilter(key)}
                          selectedKeys={new Set([correlationFilter.toString()])}
                        >
                          <DropdownItem key="all">All Correlations</DropdownItem>
                          {CORRELATION_LEVELS.filter((l) => l.value > 0).map((level) => (
                            <DropdownItem key={level.value.toString()}>
                              {level.label} - {level.description}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200">
                      <Table
                        aria-label="CO-PO/PSO Mapping Matrix"
                        className="min-w-full bg-white"
                        classNames={{
                          th: 'bg-slate-50 text-slate-700 py-4 font-semibold',
                          td: 'py-3',
                        }}
                      >
                        <TableHeader>
                          <TableColumn className="min-w-[300px] text-left font-semibold">Course Outcome</TableColumn>
                          {filteredProgramOutcomes.pos.map((po) => (
                            <TableColumn key={po.id} className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-indigo-600">PO{po.index}</span>
                                <Tooltip content={po.description}>
                                  <Info size={14} className="cursor-pointer mt-1 text-indigo-500" />
                                </Tooltip>
                              </div>
                            </TableColumn>
                          ))}
                          {filteredProgramOutcomes.psos.map((pso) => (
                            <TableColumn key={pso.id} className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-bold text-indigo-600">PSO{pso.index}</span>
                                <Tooltip content={pso.description}>
                                  <Info size={14} className="cursor-pointer mt-1 text-indigo-500" />
                                </Tooltip>
                              </div>
                            </TableColumn>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {filteredCourseOutcomes.length > 0 ? (
                            filteredCourseOutcomes.map((co) => (
                              <TableRow key={co.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="text-left">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-slate-800">{co.code}</span>
                                      <Chip
                                        size="sm"
                                        color={COGNITIVE_LEVELS[co.cognitiveLevel]?.color || 'default'}
                                        variant="flat"
                                        className="text-xs"
                                      >
                                        {co.cognitiveLevel}
                                      </Chip>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2">{co.description}</p>
                                  </div>
                                </TableCell>
                                {[...filteredProgramOutcomes.pos, ...filteredProgramOutcomes.psos].map((outcome) => {
                                  const mappingKey = `${outcome.type}-${outcome.id}`;
                                  const mapping = localMappings[co.id]?.[mappingKey] || { level: 0, justification: '' };
                                  const correlationLevel = mapping.level;

                                  return (
                                    <TableCell
                                      key={mappingKey}
                                      className={`${getCellBackground(correlationLevel)} transition-colors`}
                                    >
                                      <div className="flex flex-col items-center gap-1">
                                        <Dropdown>
                                          <DropdownTrigger>
                                            <Button
                                              size="sm"
                                              aria-label={`Set correlation for ${co.code} - ${outcome.type}${outcome.index}`}
                                              className="w-24 h-8 py-0 bg-transperent border-slate-200 rounded-md shadow-sm"
                                            >
                                              {correlationLevel !== undefined && correlationLevel !== null ? (
                                                <div className="flex items-center gap-2">
                                                  <Chip
                                                    size="sm"
                                                    color={CORRELATION_LEVELS.find(level => level.value === correlationLevel)?.color || 'default'}
                                                    variant="flat"
                                                  >
                                                    {CORRELATION_LEVELS.find(level => level.value === correlationLevel)?.label || 'N/A'}
                                                  </Chip>
                                                </div>
                                              ) : (
                                                "Select"
                                              )}
                                            </Button>
                                          </DropdownTrigger>
                                          <DropdownMenu
                                            aria-label="Correlation Levels"
                                            onAction={(key) => updateMapping(co.id, mappingKey, parseInt(key))}
                                            selectedKeys={correlationLevel ? new Set([correlationLevel.toString()]) : new Set()}
                                          >
                                            {CORRELATION_LEVELS.map((level) => (
                                              <DropdownItem key={level.value.toString()}>
                                                <div className="flex items-center gap-2">
                                                  <Chip size="sm" color={level.color} variant="flat">
                                                    {level.label}
                                                  </Chip>
                                                  <span className="text-xs">{level.description}</span>
                                                </div>
                                              </DropdownItem>
                                            ))}
                                          </DropdownMenu>
                                        </Dropdown>
                                        {correlationLevel > 0 && (
                                          <Button
                                            size="sm"
                                            isIconOnly
                                            variant="light"
                                            onClick={() => editJustification(co.id, mappingKey)}
                                            className={`text-${mapping.justification ? 'indigo-600' : 'slate-400'} hover:text-indigo-700`}
                                            title={mapping.justification ? 'Edit justification' : 'Add justification'}
                                          >
                                            {mapping.justification ? <Edit size={14} /> : <Plus size={14} />}
                                          </Button>
                                        )}
                                        {mapping.justification && (
                                          <Tooltip content={mapping.justification}>
                                            <span className="text-xs text-indigo-600 cursor-pointer hover:underline">
                                              View
                                            </span>
                                          </Tooltip>
                                        )}
                                      </div>
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={totalColumns} className="text-center py-6 text-slate-500">
                                No results match the current filters.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'stats' && stats && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    <Card className="p-6 bg-white shadow-md rounded-xl border border-slate-200">
                      <h3 className="text-xl font-semibold text-slate-800 mb-4">Mapping Overview</h3>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2 text-slate-700">
                            <span className="font-medium">Coverage</span>
                            <span className="font-semibold">{stats.coverage.toFixed(1)}%</span>
                          </div>
                          <Progress
                            value={stats.coverage}
                            color={stats.coverage > 60 ? 'success' : stats.coverage > 30 ? 'warning' : 'danger'}
                            className="h-4 rounded-full"
                            showValueLabel
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center mt-6">
                          <div className="bg-slate-50 p-4 rounded-lg shadow-sm">
                            <span className="text-3xl font-bold text-indigo-600">{stats.total}</span>
                            <p className="text-sm text-slate-500 mt-1">Total Mappings</p>
                          </div>
                          <div className="bg-slate Consciousness mapping 50 p-4 rounded-lg shadow-sm">
                            <span className="text-3xl font-bold text-indigo-600">{stats.byType.PO}</span>
                            <p className="text-sm text-slate-500 mt-1">PO Mappings</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg shadow-sm">
                            <span className="text-3xl font-bold text-indigo-600">{stats.byType.PSO}</span>
                            <p className="text-sm text-slate-500 mt-1">PSO Mappings</p>
                          </div>
                        </div>
                        <div className="mt-6">
                          <h4 className="font-medium text-slate-700 mb-3">Correlation Distribution</h4>
                          <div className="relative w-full h-64 border border-slate-200 rounded-lg p-2 bg-white">
                            <canvas ref={chartRef} className="w-full h-full"></canvas>
                          </div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 bg-white shadow-md rounded-xl border border-slate-200">
                      <h3 className="text-xl font-semibold text-slate-800 mb-4">Course Outcome Analysis</h3>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.entries(stats.byCO).map(([coId, count]) => {
                          const co = mappingData.courseOutcomes.find((c) => c.id === coId);
                          if (!co) return null;
                          const totalPossible = filteredProgramOutcomes.pos.length + filteredProgramOutcomes.psos.length;
                          const coveragePercent = totalPossible > 0 ? (count / totalPossible) * 100 : 0;
                          return (
                            <div key={coId} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-300 transition-all">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800">{co.code}</span>
                                  <Chip
                                    size="sm"
                                    color={COGNITIVE_LEVELS[co.cognitiveLevel]?.color || 'default'}
                                    variant="flat"
                                  >
                                    {co.cognitiveLevel}
                                  </Chip>
                                </div>
                                <span className="text-sm text-slate-600 font-medium">
                                  {count}/{totalPossible} ({coveragePercent.toFixed(0)}%)
                                </span>
                              </div>
                              <Progress
                                value={coveragePercent}
                                color={coveragePercent > 70 ? 'success' : coveragePercent > 40 ? 'warning' : 'danger'}
                                className="h-2 rounded-full"
                              />
                              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{co.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                )}

                <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-md border border-slate-200">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-slate-700">Correlation Levels:</span>
                    {CORRELATION_LEVELS.filter((l) => l.value > 0).map((level) => (
                      <Chip
                        key={level.value}
                        color={level.color}
                        size="sm"
                        variant="flat"
                        className="transition-all hover:scale-105"
                      >
                        {level.label} - {level.description}
                      </Chip>
                    ))}
                  </div>
                  <Button
                    color="primary"
                    onClick={handleSave}
                    isLoading={isSubmitting}
                    startContent={<Save size={18} />}
                    isDisabled={!hasChanges}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md rounded-lg px-6"
                  >
                    Save Mappings
                  </Button>
                </div>
              </>
            )}

            {!isLoading && (!subject || !academicYear) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 text-center mt-6 shadow-lg"
              >
                <BookOpen size={48} className="mx-auto mb-4 text-indigo-500" />
                <p className="text-lg font-semibold text-slate-700">
                  Select an academic year and subject to begin mapping.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Align course outcomes with program objectives for better curriculum planning.
                </p>
              </motion.div>
            )}
            {!isLoading && mappingData?.courseOutcomes?.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 text-center mt-6 shadow-lg"
              >
                <Info size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-700">
                  No course outcomes found for the selected subject and year.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Ensure outcomes are defined or try a different subject.
                </p>
              </motion.div>
            )}
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="bg-white">
          <ModalContent>
            <ModalHeader className="border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800">Mapping Justification</h3>
            </ModalHeader>
            <ModalBody className="p-6">
              {selectedMapping && mappingData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <Chip
                      color="primary"
                      variant="flat"
                      className="bg-indigo-100 text-indigo-700"
                    >
                      {mappingData.courseOutcomes.find((co) => co.id === selectedMapping.coId)?.code || 'CO'}
                    </Chip>
                    <span className="text-2xl text-slate-500">→</span>
                    <Chip
                      color="secondary"
                      variant="flat"
                      className="bg-indigo-100 text-indigo-700"
                    >
                      {selectedMapping.poId.split('-')[0]}
                      {mappingData.programOutcomes.pos
                        .concat(mappingData.programOutcomes.psos)
                        .find((po) => `${po.type}-${po.id}` === selectedMapping.poId)?.index}
                    </Chip>
                    <Chip
                      color={CORRELATION_LEVELS[localMappings[selectedMapping.coId]?.[selectedMapping.poId]?.level || 0].color}
                      size="lg"
                      className="text-white"
                    >
                      Level {localMappings[selectedMapping.coId]?.[selectedMapping.poId]?.level || 0}
                    </Chip>
                  </div>
                  <Textarea
                    label="Justification"
                    placeholder="Explain how this course outcome supports the program outcome..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="w-full bg-white border-slate-200 rounded-lg"
                    rows={6}
                  />
                </motion.div>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-slate-200">
              <Button variant="light" onPress={onClose} className="text-slate-700">
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={saveJustification}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </motion.div>
    </div>
  );
};

export default MappingPage;