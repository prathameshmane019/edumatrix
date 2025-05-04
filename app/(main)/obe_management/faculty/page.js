"use client";
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Accordion,
  AccordionItem,
  Button,
  Select,
  SelectItem,
  Spinner
} from '@nextui-org/react';
import { BookOpen, Target, Award, GraduationCap, Info, ArrowRight } from 'lucide-react';
import { FaQuestion } from 'react-icons/fa';
import { toast } from 'sonner';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';
import { getAcademicYears } from '@/app/utils/acadmicYears';
import { PsoIllustration, EducationHeaderIllustration, ImplementationProcessIllustration, PeoIllustration, PoIllustration, CoIllustration } from '@/public/illustrations/obe';
export default function OBEFacultyGuidePage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState('');
  const [peos, setPeos] = useState([]);
  const [pos, setPos] = useState([]);
  const [psos, setPsos] = useState([]);
  const academicYears = getAcademicYears(10);

  // Set default academic year
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const defaultAcademicYear = currentMonth >= 7
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;
    setAcademicYear(defaultAcademicYear);
  }, []);

  // Fetch OBE data when academic year changes
  useEffect(() => {
    if (!academicYear || !user?.institute?._id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [peoRes, outcomeRes] = await Promise.all([
          axios.get('/api/v2/obe/peo', {
            params: { institute: user?.institute?._id, year: academicYear },
          }),
          axios.get('/api/v2/obe/program-outcomes', {
            params: {
              institute: user?.institute?._id,
              dept: user?.department,
              year: academicYear,
            },
          }),
        ]);

        setPeos(peoRes.data.data || []);
        setPos(outcomeRes.data.data.programOutcomes || []);
        setPsos(outcomeRes.data.data.programSpecificOutcomes || []);
      } catch (error) {
        console.error('Error fetching OBE data:', error);
        toast.error('Failed to load OBE data');
        setPeos([]);
        setPos([]);
        setPsos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [academicYear, user]);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <Card className="mb-6 border-none shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-20 -mt-20 z-0 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-100 rounded-full -ml-16 -mb-16 z-0 opacity-60"></div>
        <CardHeader className="relative z-10 bg-white border-b border-slate-100 justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-full">
              <GraduationCap size={32} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Outcome-Based Education</h1>
              <p className="text-slate-500 text-sm">Faculty Guide & Resource Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              label="Academic Year"
              variant='flat'
              color='secondary'
              selectedKeys={[academicYear]}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-44 bg-white"
              size="sm"
            >
              {academicYears.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </Select>
             
          </div>
        </CardHeader>
        <CardBody className="p-6 flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="flex-1">
            <p className="text-slate-600 mb-4">
              Welcome, <span className="font-semibold text-indigo-600">{user?.personalDetails?.name || 'Faculty'}</span>!
              This guide introduces Outcome-Based Education, a student-centered approach focusing on measurable learning outcomes.
            </p>
            <Button
              color="primary"
              className="bg-indigo-600 hover:bg-indigo-700"
              endContent={<ArrowRight size={16} />}
              onPress={() => document.getElementById('components').scrollIntoView({ behavior: 'smooth' })}
            >
              Explore OBE Components
            </Button>
          </div>
          <div className="flex-1 flex justify-center items-center">
          <EducationHeaderIllustration
            className="w-24 h-24 object-contain hidden md:block"
            style={{ maxWidth: '80%', maxHeight: '80%' }}
          />
          </div>
        </CardBody>
      </Card>

      {/* Key Components Grid */}
      <div id="components" className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 rounded-full">
            <Target size={20} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Key OBE Components</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-md border-none hover:shadow-lg transition-all">
            <CardHeader className="bg-white border-b border-slate-100 p-4 gap-3">
              <div className="p-2 bg-blue-50 rounded-full">
                <Target size={18} className="text-blue-600" />
              </div>
              <h3 className="text-md font-medium text-slate-800">
                Program Educational Objectives
              </h3>
            </CardHeader>
            <CardBody className="p-4 flex items-center gap-3">
              <PeoIllustration className="w-16 h-16 object-contain" />
              <p className="text-sm text-slate-600">
                Long-term career and professional goals for graduates 3-5 years post-graduation.
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-md border-none hover:shadow-lg transition-all">
            <CardHeader className="bg-white border-b border-slate-100 p-4 gap-3">
              <div className="p-2 bg-indigo-50 rounded-full">
                <Award size={18} className="text-indigo-600" />
              </div>
              <h3 className="text-md font-medium text-slate-800">
                Program Outcomes
              </h3>
            </CardHeader>
            <CardBody className="p-4 flex items-center gap-3">
              <PoIllustration className="w-16 h-16 object-contain" />
              <p className="text-sm text-slate-600">
                Competencies and skills graduates achieve upon program completion.
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-md border-none hover:shadow-lg transition-all">
            <CardHeader className="bg-white border-b border-slate-100 p-4 gap-3">
              <div className="p-2 bg-teal-50 rounded-full">
                <Info size={18} className="text-teal-600" />
              </div>
              <h3 className="text-md font-medium text-slate-800">
                Program Specific Outcomes
              </h3>
            </CardHeader>
            <CardBody className="p-4 flex items-center gap-3">
              <PsoIllustration className="w-16 h-16 object-contain" />
              <p className="text-sm text-slate-600">
                Unique competencies tailored to a specific discipline or program.
              </p>
            </CardBody>
          </Card>

          <Card className="shadow-md border-none hover:shadow-lg transition-all">
            <CardHeader className="bg-white border-b border-slate-100 p-4 gap-3">
              <div className="p-2 bg-amber-50 rounded-full">
                <BookOpen size={18} className="text-amber-600" />
              </div>
              <h3 className="text-md font-medium text-slate-800">
                Course Outcomes
              </h3>
            </CardHeader>
            <CardBody className="p-4 flex items-center gap-3">
              <CoIllustration
                className="w-16 h-16 object-contain"
              />
              <p className="text-sm text-slate-600">
                Measurable skills and knowledge students acquire in each course.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Program Outcomes Section */}
      <Card className="mb-8 shadow-lg border-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 z-0"></div>
        <CardHeader className="relative z-10 bg-white border-b border-slate-100 p-4 flex gap-3">
          <div className="p-2 bg-indigo-50 rounded-full">
            <GraduationCap size={20} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            Your Program&#39;s Outcomes
          </h2>
        </CardHeader>
        <CardBody className="p-4 relative z-10">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner color="primary" label="Loading outcomes..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* PEOs Column */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-blue-50 rounded-full">
                    <Target size={16} className="text-blue-600" />
                  </div>
                  <h3 className="text-md font-semibold text-slate-800">PEOs</h3>
                </div>
                {peos.length > 0 ? (
                  <div className="space-y-2">
                    {peos.map((peo) => (
                      <div key={peo.index} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">PEO{peo.index}</span>
                        <p className="text-sm text-slate-600 mt-2">{peo.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex justify-center items-center">
                    <p className="text-slate-500 italic text-sm">No PEOs defined</p>
                  </div>
                )}
              </div>

              {/* POs Column */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-indigo-50 rounded-full">
                    <Award size={16} className="text-indigo-600" />
                  </div>
                  <h3 className="text-md font-semibold text-slate-800">POs</h3>
                </div>
                {pos.length > 0 ? (
                  <div className="space-y-2">
                    {pos.map((po) => (
                      <div key={po.index} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">PO{po.index}</span>
                        <p className="text-sm text-slate-600 mt-2">{po.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex justify-center items-center">
                    <p className="text-slate-500 italic text-sm">No POs defined</p>
                  </div>
                )}
              </div>

              {/* PSOs Column */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-teal-50 rounded-full">
                    <Info size={16} className="text-teal-600" />
                  </div>
                  <h3 className="text-md font-semibold text-slate-800">PSOs</h3>
                </div>
                {psos.length > 0 ? (
                  <div className="space-y-2">
                    {psos.map((pso) => (
                      <div key={pso.index} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">PSO{pso.index}</span>
                        <p className="text-sm text-slate-600 mt-2">{pso.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex justify-center items-center">
                    <p className="text-slate-500 italic text-sm">No PSOs defined</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Implementation Steps */}
      <Card className="mb-8 shadow-lg border-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full -ml-32 -mb-32 z-0"></div>
        <CardHeader className="relative z-10 bg-white border-b border-slate-100 p-4 flex gap-3">
          <div className="p-2 bg-teal-50 rounded-full">
            <BookOpen size={20} className="text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            Implementation Process
          </h2>
        </CardHeader>
        <CardBody className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1  text-slate-600">
              <ImplementationProcessIllustration 
                // className="w-[20] h-[20] md:w-24  object-contain"
              />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-blue-600 font-bold text-2xl mb-2">01</div>
                <h3 className="font-medium text-slate-800 mb-1">Define Course Outcomes</h3>
                <p className="text-xs text-slate-600">
                  Create measurable COs using Bloom&#39;s Taxonomy verbs
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-indigo-600 font-bold text-2xl mb-2">02</div>
                <h3 className="font-medium text-slate-800 mb-1">Map COs to POs/PSOs</h3>
                <p className="text-xs text-slate-600">
                  Create correlation matrices (Low, Medium, High)
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-violet-600 font-bold text-2xl mb-2">03</div>
                <h3 className="font-medium text-slate-800 mb-1">Design Assessments</h3>
                <p className="text-xs text-slate-600">
                  Link assessment questions to specific COs
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-teal-600 font-bold text-2xl mb-2">04</div>
                <h3 className="font-medium text-slate-800 mb-1">Record Performance</h3>
                <p className="text-xs text-slate-600">
                  Input marks for CO-linked questions
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-emerald-600 font-bold text-2xl mb-2">05</div>
                <h3 className="font-medium text-slate-800 mb-1">Calculate Attainment</h3>
                <p className="text-xs text-slate-600">
                  Compute CO and PO/PSO attainment levels
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-amber-600 font-bold text-2xl mb-2">06</div>
                <h3 className="font-medium text-slate-800 mb-1">Improve Continuously</h3>
                <p className="text-xs text-slate-600">
                  Refine teaching based on attainment data
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* FAQs */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-none h-full">
            <CardHeader className="bg-white border-b border-slate-100 p-4 flex gap-3">
              <div className="p-2 bg-amber-50 rounded-full">
                <FaQuestion size={18} className="text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Frequently Asked Questions
              </h2>
            </CardHeader>
            <CardBody className="p-3">
              <Accordion variant='light' className="p-5">
                <AccordionItem
                  key="1"
                  title={
                    <span className="text-slate-800 font-medium">How do PEOs differ from POs?</span>
                  }
                  className="py-1"
                >
                  <p className="text-sm text-slate-600 p-2">
                    PEOs are long-term goals (3-5 years post-graduation) while POs are immediate competencies achieved upon graduation.
                  </p>
                </AccordionItem>
                <AccordionItem
                  key="2"
                  title={
                    <span className="text-slate-800 font-medium">How to write effective COs?</span>
                  }
                  className="py-1"
                >
                  <p className="text-sm text-slate-600 p-2">
                    Use Bloom&#39;s Taxonomy verbs and follow SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound).
                  </p>
                </AccordionItem>
                <AccordionItem
                  key="3"
                  title={
                    <span className="text-slate-800 font-medium">What is attainment in OBE?</span>
                  }
                  className="py-1"
                >
                  <p className="text-sm text-slate-600 p-2">
                    Attainment measures the percentage of students meeting defined outcomes, evaluating teaching effectiveness.
                  </p>
                </AccordionItem>
                <AccordionItem
                  key="4"
                  title={
                    <span className="text-slate-800 font-medium">How can I improve attainment levels?</span>
                  }
                  className=""
                >
                  <p className="text-sm text-slate-600 p-2">
                    Analyze gaps in student performance, incorporate active learning techniques, and align assessments more closely with course outcomes.
                  </p>
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
        </div>

        {/* Quick Links */}
        <div>
          <Card className="shadow-lg border-none h-full">
            <CardHeader className="bg-white border-b border-slate-100 p-4 flex gap-3">
              <div className="p-2 bg-indigo-50 rounded-full">
                <BookOpen size={20} className="text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Resources
              </h2>
            </CardHeader>
            <CardBody className="p-4">
              <div className="flex flex-col gap-3">
                <Button
                  color="default"
                  variant="bordered"
                  className="justify-start h-12 bg-white border-slate-200"
                  as="a"
                  href="https://www.nbaind.org/"
                  target="_blank"
                  startContent={
                    <div className="p-1 bg-blue-50 rounded-full">
                      <BookOpen size={16} className="text-blue-600" />
                    </div>
                  }
                >
                  NBA Guidelines
                </Button>

                <Button
                  color="default"
                  variant="bordered"
                  className="justify-start h-12 bg-white border-slate-200"
                  as="a"
                  href="https://www.abet.org/"
                  target="_blank"
                  startContent={
                    <div className="p-1 bg-indigo-50 rounded-full">
                      <BookOpen size={16} className="text-indigo-600" />
                    </div>
                  }
                >
                  ABET Resources
                </Button>

                <Button
                  color="default"
                  variant="bordered"
                  className="justify-start h-12 bg-white border-slate-200"
                  as="a"
                  href="/obe/training"
                  startContent={
                    <div className="p-1 bg-violet-50 rounded-full">
                      <GraduationCap size={16} className="text-violet-600" />
                    </div>
                  }
                >
                  OBE Training
                </Button>

                <Button
                  color="default"
                  variant="bordered"
                  className="justify-start h-12 bg-white border-slate-200"
                  as="a"
                  href="/grievance"
                  startContent={
                    <div className="p-1 bg-teal-50 rounded-full">
                      <Info size={16} className="text-teal-600" />
                    </div>
                  }
                >
                  Help Center
                </Button>

              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}