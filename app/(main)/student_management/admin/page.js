"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
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
  Legend,
  LineChart,
  Line,
} from "recharts";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  UserCog, 
  Calendar,
  BookOpen,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Select, SelectItem, Spinner, Card, CardBody, CardHeader, Button } from "@nextui-org/react";
import { DepartmentDropdown } from "@/app/components/department/DepartmentDropDowns";
import { useUser } from "@/app/context/UserContext";

// Academic Year Utilities
const getCurrentAcademicYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  return month < 3 ? `${year - 1}-${year}` : `${year}-${year + 1}`;
};

const getAcademicYears = (yearsBack) => {
  const currentYear = new Date().getFullYear();
  const academicYears = [];
  for (let i = 0; i < yearsBack; i++) {
    const startYear = currentYear - i;
    academicYears.push({
      label: `${startYear}-${startYear + 1}`,
      value: `${startYear}-${startYear + 1}`,
    });
  }
  return academicYears;
};

// Custom colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#a4de6c"];
const STATUS_COLORS = {
  active: "#4ade80", // green
  suspended: "#f87171", // red
  alumni: "#60a5fa", // blue
};

const StudentDashboard = () => {
  const { user, loading: userLoading } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [showFilters, setShowFilters] = useState(false);

  // Determine institute ID and default department based on user role
  const { instituteId, defaultDepartment, userRole } = useMemo(() => {
    if (!user) return { instituteId: null, defaultDepartment: null, userRole: null };
    
    if (user.role === "superadmin") {
      return { 
        instituteId: user._id, 
        defaultDepartment: "all",
        userRole: "superadmin"
      };
    } else {
      return {
        instituteId: user.institute?._id || user.institute,
        defaultDepartment: user.department || "all",
        userRole: user.role
      };
    }
  }, [user]);

  // Handle department selection
  const handleDepartmentSelect = (value) => {
    const newValue = value.target ? value.target.value : value;
    setSelectedDepartment(newValue);
  };

  // Set default department when user loads
  useEffect(() => {
    if (user && defaultDepartment) {
      setSelectedDepartment(defaultDepartment);
    }
  }, [user, defaultDepartment]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchStudentDashboardData = async () => {
      if (!instituteId || !selectedDepartment || !academicYear) {
        if (!userLoading) setError("Missing required parameters");
        return;
      }

      setLoading(true);
      try {
        const params = {
          instituteId,
          userRole: user.role,
          academicYear,
        };
        
        if (selectedDepartment !== "all") {
          params.department = selectedDepartment;
        }

        const response = await axios.get("/api/v2/student_dashboard", { params });
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching student dashboard data:", err);
        setError(err.response?.data?.error || "Failed to load student dashboard data");
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    if (instituteId && selectedDepartment && academicYear) {
      fetchStudentDashboardData();
    }
  }, [instituteId, selectedDepartment, academicYear, userLoading, user?.role]);

  // Loading states
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" color="primary" />
        <span className="ml-3">Loading user data...</span>
      </div>
    );
  }

  if (!user || !instituteId) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        User authentication or institute information required
      </div>
    );
  }

  // Extract data for charts
  const statusData = dashboardData?.statusDistribution || [];
  const deptData = dashboardData?.departmentDistribution || [];
  const genderData = dashboardData?.genderDistribution || [];
  const categoryData = dashboardData?.categoryDistribution || [];
  const classData = dashboardData?.classDistribution || [];
  const admissionTrend = dashboardData?.monthlyAdmissions || [];

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <div className="text-sm text-gray-600">
              {academicYear ? `Academic Year: ${academicYear}` : ""}
            </div>
            <Button 
              size="sm" 
              variant="flat" 
              startContent={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardBody className="py-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <Select
                    placeholder="Select Year"
                    variant="bordered"
                    size="sm"
                    selectedKeys={academicYear ? [academicYear] : []}
                    onSelectionChange={(keys) => setAcademicYear(Array.from(keys)[0])}
                    startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                    className="max-w-72"
                  >
                    {getAcademicYears(10).map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                {(userRole === "superadmin" || userRole === "admin") && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <DepartmentDropdown
                      instituteId={instituteId}
                      onSelect={handleDepartmentSelect}
                      selectedDepartment={selectedDepartment}
                    />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-10 flex items-center justify-center h-64">
            <Spinner size="lg" color="primary" />
            <span className="ml-3 text-gray-600">Loading student data...</span>
          </div>
        ) : error || !dashboardData ? (
          <div className="bg-white rounded-xl shadow-sm p-10 flex items-center justify-center h-64">
            <div className="text-xl font-medium text-red-600">{error || "Failed to load student data"}</div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="py-4">
                  <div className="flex items-center">
                    <Users size={24} className="text-blue-600 mr-4" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500">Total Students</p>
                      <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.totalStudents}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="py-4">
                  <div className="flex items-center">
                    <UserCheck size={24} className="text-green-600 mr-4" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500">Active Students</p>
                      <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.activeStudents}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="py-4">
                  <div className="flex items-center">
                    <UserX size={24} className="text-red-600 mr-4" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500">Suspended</p>
                      <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.suspendedStudents}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="py-4">
                  <div className="flex items-center">
                    <UserCog size={24} className="text-purple-600 mr-4" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-500">Alumni</p>
                      <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.alumniStudents}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Charts - First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Status Distribution */}
              <Card className="shadow-sm">
                <CardHeader className="pb-0 pt-4 px-4">
                  <h2 className="text-lg font-semibold text-gray-800">Status Distribution</h2>
                </CardHeader>
                <CardBody className="py-2 px-2">
                  <div className="h-64">
                    {statusData.length > 0 ? (
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={statusData}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusData.map((entry) => (
                              <Cell 
                                key={`cell-${entry.status}`} 
                                fill={STATUS_COLORS[entry.status] || COLORS[0]} 
                              />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No status data available
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Gender Distribution */}
              <Card className="shadow-sm">
                <CardHeader className="pb-0 pt-4 px-4">
                  <h2 className="text-lg font-semibold text-gray-800">Gender Distribution</h2>
                </CardHeader>
                <CardBody className="py-2 px-2">
                  <div className="h-64">
                    {genderData.length > 0 ? (
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={genderData}
                            dataKey="count"
                            nameKey="gender"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {genderData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No gender data available
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Charts - Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Department Distribution (superadmin and admin only) */}
              {(userRole === "superadmin" || userRole === "admin") && selectedDepartment === "all" && deptData.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-0 pt-4 px-4">
                    <h2 className="text-lg font-semibold text-gray-800">Department Distribution</h2>
                  </CardHeader>
                  <CardBody className="py-2 px-2">
                    <div className="h-72">
                      <ResponsiveContainer>
                        <BarChart data={deptData.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="department" 
                            type="category" 
                            width={100}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                          <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Class Distribution */}
              <Card className="shadow-sm">
                <CardHeader className="pb-0 pt-4 px-4">
                  <h2 className="text-lg font-semibold text-gray-800">Class Distribution</h2>
                </CardHeader>
                <CardBody className="py-2 px-2">
                  <div className="h-72">
                    {classData.length > 0 ? (
                      <ResponsiveContainer>
                        <BarChart data={classData.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="className" 
                            type="category" 
                            width={100}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                          <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No class data available
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Fill the grid if department distribution isn't shown */}
              {!(userRole === "superadmin" && selectedDepartment === "all" && deptData.length > 0) && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-0 pt-4 px-4">
                    <h2 className="text-lg font-semibold text-gray-800">Monthly Admissions</h2>
                  </CardHeader>
                  <CardBody className="py-2 px-2">
                    <div className="h-72">
                      {admissionTrend.length > 0 ? (
                        <ResponsiveContainer>
                          <LineChart data={admissionTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value} students`, 'Admissions']} />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              stroke="#8884d8" 
                              strokeWidth={2} 
                              dot={{ r: 4 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No admission trend data available
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Charts - Third Row */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Admission Category Distribution */}
              <Card className="shadow-sm">
                <CardHeader className="pb-0 pt-4 px-4">
                  <h2 className="text-lg font-semibold text-gray-800">Admission Category Distribution</h2>
                </CardHeader>
                <CardBody className="py-2 px-2">
                  <div className="h-64">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer>
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                          <Bar dataKey="count" fill="#0088FE" radius={[4, 4, 0, 0]}>
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No category data available
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* If Monthly Admissions wasn't shown above, show it here */}
            {(userRole === "superadmin" && selectedDepartment === "all" && deptData.length > 0) && (
              <Card className="shadow-sm mb-6">
                <CardHeader className="pb-0 pt-4 px-4">
                  <h2 className="text-lg font-semibold text-gray-800">Monthly Admissions</h2>
                </CardHeader>
                <CardBody className="py-2 px-2">
                  <div className="h-64">
                    {admissionTrend.length > 0 ? (
                      <ResponsiveContainer>
                        <LineChart data={admissionTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} students`, 'Admissions']} />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#8884d8" 
                            strokeWidth={2} 
                            dot={{ r: 4 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No admission trend data available
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Age Info Card */}
            <Card className="shadow-sm mb-6 bg-blue-50">
              <CardBody className="py-4">
                <div className="flex items-center">
                  <Clock size={24} className="text-blue-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Average Student Age</p>
                    <p className="text-2xl font-bold text-gray-800">{dashboardData.avgAge} years</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;