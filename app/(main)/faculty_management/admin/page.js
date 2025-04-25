"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
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
} from "recharts";
import { Users, Briefcase, Building, Clock, BookOpen, Calendar } from "lucide-react";
import { Select, SelectItem, Spinner } from "@nextui-org/react";
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

const FacultyDashboard = () => {
  const { user, loading: userLoading } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());

  const { instituteId, defaultDepartment } = useMemo(() => {
    if (!user) return { instituteId: null, defaultDepartment: null };
    if (user.role === "superadmin") {
      return { instituteId: user._id, defaultDepartment: "all" };
    } else {
      return {
        instituteId: user.institute?._id || user.institute,
        defaultDepartment: user.department || user.id,
      };
    }
  }, [user]);

  const handleDepartmentSelect = (value) => {
    const newValue = value.target ? value.target.value : value;
    setSelectedDepartment(newValue);
  };

  useEffect(() => {
    if (user && defaultDepartment) {
      setSelectedDepartment(defaultDepartment);
    }
  }, [user, defaultDepartment]);

  useEffect(() => {
    const fetchFacultyDashboardData = async () => {
      if (!instituteId || !selectedDepartment || !academicYear) {
        if (!userLoading) setError("Institute ID, department, or academic year is required");
        return;
      }

      setLoading(true);
      try {
        const params = {
          instituteId,
          userRole: user.role,
          academicYear,
        };
        if (selectedDepartment !== "all") params.department = selectedDepartment;

        const response = await axios.get("/api/v2/faculty_dashboard", { params });
        setDashboardData(response.data);
        console.log(response.data);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching faculty dashboard data:", err);
        setError(err.response?.data?.error || "Failed to load faculty dashboard data");
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    if (instituteId && selectedDepartment && academicYear) {
      fetchFacultyDashboardData();
    }
  }, [instituteId, selectedDepartment, academicYear, userLoading, user?.role]);

  if (userLoading) {
    return <div className="flex items-center justify-center h-screen">Loading user data...</div>;
  }

  if (!user || !instituteId) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        User authentication or institute information required
      </div>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  const employmentTypeData = dashboardData?.employmentTypeDistribution || [];
  const deptData = dashboardData?.departmentDistribution || [];
  const designationData = dashboardData?.designationDistribution || [];
  const educationData = dashboardData?.educationDistribution || [];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
      <div className="mb-8">
  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
    <CardHeader className="flex justify-between">
      <h1 className="text-3xl font-bold text-slate-800">Faculty Dashboard</h1>
      <div className="text-sm text-slate-500">
        {academicYear ? `Viewing data for: ${academicYear}` : ""}
      </div>
    </CardHeader>
    <CardBody>
      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
          <Select
            placeholder="Select Year"
            variant="bordered"
            size="sm"
            selectedKeys={academicYear ? [academicYear] : []}
            onSelectionChange={(keys) => setAcademicYear(Array.from(keys)[0])}
            startContent={<Calendar className="w-4 h-4 text-default-400" />}
            className="max-w-72"
          >
            {getAcademicYears(10).map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </Select>
        </div>
        
        {user.role === "superadmin" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
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
</div>

        {loading ? (
           <div className="flex justify-center items-center py-12">
                              <Spinner size="lg" color="primary" />
                            </div>
        ) : error || !dashboardData ? (
          <div className="bg-white rounded-xl shadow-sm p-10 flex items-center justify-center h-64">
            <div className="text-xl font-medium text-red-600">{error || "Failed to load faculty data"}</div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Users size={24} className="text-blue-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Faculty</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.totalFaculty}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Briefcase size={24} className="text-green-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Teaching Faculty</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.teachingFaculty}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Building size={24} className="text-purple-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Non-Teaching Faculty</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.nonTeachingFaculty}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Clock size={24} className="text-teal-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Avg. Experience</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.avgExperience} yrs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Employment Type Distribution */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Employment Type Distribution</h2>
                <div className="h-72">
                  {employmentTypeData.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={employmentTypeData}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {employmentTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      No employment type data available
                    </div>
                  )}
                </div>
              </div>

              {/* Department Distribution (superadmin only) */}
              {user.role === "superadmin" && selectedDepartment === "all" && (
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Department Distribution</h2>
                  <div className="h-72">
                    {deptData.length > 0 ? (
                      <ResponsiveContainer>
                        <BarChart data={deptData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="department" angle={-45} textAnchor="end" height={70} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500">
                        No department data available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Designation Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Designation Distribution</h2>
              <div className="h-72">
                {designationData.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={designationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="designation" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    No designation data available
                  </div>
                )}
              </div>
            </div>

            {/* Education Level Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Education Level Distribution</h2>
              <div className="h-72">
                {educationData.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={educationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="degree" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00C49F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    No education data available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;