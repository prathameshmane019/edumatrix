"use client"
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Users, BookOpen, GraduationCap, UserCheck, Briefcase, Layers, BarChart2, Calendar } from 'lucide-react';
import { Select, SelectItem, Spinner } from "@nextui-org/react";
import { DepartmentDropdown } from '@/app/components/department/DepartmentDropDowns';
import { useUser } from '@/app/context/UserContext';
import { getCurrentAcademicYear, getAcademicYears } from '@/app/utils/acadmicYears';
import { Card, CardHeader, CardBody } from "@nextui-org/react";

const Dashboard = () => {
  const { user, loading: userLoading } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [data, setData] = useState([]);

  // Set up institute ID based on user role
  const instituteId = useMemo(() => {
    if (!user) return null;
    return user.role === 'superadmin' ? user._id : user.institute?._id;
  }, [user]);

  // Handle department selection change
  const handleDepartmentSelect = (departmentId) => {
    // Fixed to handle both event objects and direct values
    if (departmentId && departmentId.target) {
      setSelectedDepartment(departmentId.target.value);
    } else {
      setSelectedDepartment(departmentId);
    }
  };

  useEffect(() => {
    // Initialize department selection based on user role
    if (user) {
      if (user.role !== "superadmin") {
        // For regular admin, lock to their assigned department
        setSelectedDepartment(user.id || user.department);
      } else {
        // Super admin can view all by default
        setSelectedDepartment('all');
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!instituteId) {
        if (!userLoading) setError("Institute ID is required");
        return;
      }

      if (!academicYear) {
        return; // Wait until academic year is selected
      }

      setLoading(true);
      try {
        // Build params object for axios
        const params = {
          instituteId,
          academicYear
        };

        // Only add department parameter if not viewing all departments
        if (selectedDepartment && selectedDepartment !== 'all') {
          params.department = selectedDepartment;
        }

        // Use axios instead of fetch
        const response = await axios.get('/api/v2/course_dashbord', { params });

        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.error || "Failed to load dashboard data");
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    if (instituteId && selectedDepartment && academicYear) {
      fetchDashboardData();
    }
  }, [instituteId, selectedDepartment, academicYear, userLoading]);

  // This is the fixed useEffect hook that was causing errors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await window.fs.readFile('monthly-profits.csv');
        const text = new TextDecoder().decode(response);
        const parsedData = parseCSV(text);
        setData(parsedData);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    };
    fetchData();
  }, []);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-medium">Loading user data...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-medium text-red-600">User authentication required</div>
      </div>
    );
  }

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Format department distribution data for display
  const formattedDeptData = dashboardData?.departmentDistribution?.map(item => ({
    department: item.department || 'Unknown',
    count: item.count || 0
  })) || [];

  // Format students per class data for display
  const formattedClassData = dashboardData?.studentsPerClass?.map(item => ({
    classId: item.classId || 'Unknown Class',
    count: item.count || 0
  })) || [];

  // Calculate subject type data for pie chart to avoid empty chart issues
  const subjectTypeData = dashboardData?.subjectTypes ? [
    { name: 'Theory', value: dashboardData.subjectTypes.theory || 0 },
    { name: 'Practical', value: dashboardData.subjectTypes.practical || 0 },
    { name: 'TG', value: dashboardData.subjectTypes.tg || 0 }
  ] : [];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
       <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
          <CardHeader className="flex justify-between">
          <h2 className="text-xl font-bold"> Academic Dashboard</h2>
            <div className="text-sm text-slate-500">
              {academicYear ? `Viewing data for: ${academicYear}` : ""}
            </div>
          </CardHeader>
          <CardBody>
            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                <Select
                  placeholder="Select Year"
                  variant="bordered"
                  size="sm"
                  selectedKeys={academicYear ? [academicYear] : []}
                  onSelectionChange={(keys) => setAcademicYear(Array.from(keys)[0])}
                  startContent={<Calendar className="w-4 h-4 text-default-400" />}
                  className="max-w-72 my-4"
                >
                  {getAcademicYears(10).map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              {user?.role === "superadmin" && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700">Department</label>
                  <div className="flex gap-2">
                    <DepartmentDropdown
                      instituteId={instituteId}
                      onSelect={handleDepartmentSelect}
                      className="flex-1"
                      selectedDepartment={selectedDepartment}
                    />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                      <Select
                        size="sm"
                        variant="bordered"
                        className="w-32"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <SelectItem key="all" value="all">All Depts</SelectItem>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
      

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-10 flex items-center justify-center h-64">
            <Spinner size="lg" color="primary" />
            <span className="ml-3 text-slate-600">Loading dashboard data...</span>
          </div>
        ) : error || !dashboardData ? (
          <div className="bg-white rounded-xl shadow-sm p-10 flex items-center justify-center h-64">
            <div className="text-xl font-medium text-red-600">{error || "Failed to load dashboard data"}</div>
          </div>
        ) : (
          <>
            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-3 mr-4">
                    <GraduationCap size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Classes</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.totalClasses || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-emerald-100 p-3 mr-4">
                    <BookOpen size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Subjects</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.totalSubjects || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-violet-100 p-3 mr-4">
                    <Users size={24} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Students</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.totalStudents || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-amber-100 p-3 mr-4">
                    <Briefcase size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Faculty Count</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.facultyCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Second row of metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-cyan-100 p-3 mr-4">
                    <Layers size={24} className="text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Batches</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.totalBatches || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-teal-100 p-3 mr-4">
                    <BarChart2 size={24} className="text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Content Completion</p>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold text-slate-800 mr-3">{dashboardData.contentCompletionPercentage || 0}%</p>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-teal-600 h-3 rounded-full"
                          style={{ width: `${dashboardData.contentCompletionPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-indigo-100 p-3 mr-4">
                    <UserCheck size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Semester Distribution</p>
                    <div className="flex items-center space-x-6 mt-1">
                      <div>
                        <p className="text-xs font-medium text-slate-400">Semester 1</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {dashboardData.semesterDistribution?.sem1 || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400">Semester 2</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {dashboardData.semesterDistribution?.sem2 || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Subject Type Distribution */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Subject Type Distribution</h2>
                <div className="h-72">
                  {subjectTypeData.length > 0 && subjectTypeData.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {subjectTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-500">No subject type data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Distribution - Show only if viewing all departments or if it has data */}
              {(selectedDepartment === 'all' || formattedDeptData.length > 0) && (
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Department Distribution</h2>
                  <div className="h-72">
                    {formattedDeptData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formattedDeptData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500">No department data available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Students per Class */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Students per Class</h2>
              <div className="h-72">
                {formattedClassData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedClassData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="classId" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">No class data available</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
    </div>
  );
};

export default Dashboard;