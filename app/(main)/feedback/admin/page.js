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
} from "recharts";
import { MessageSquare, Users, CheckCircle, BarChart2, PieChart as PieIcon, Calendar } from "lucide-react";
import { Select, SelectItem, Spinner } from "@nextui-org/react";
import { DepartmentDropdown } from "@/app/components/department/DepartmentDropDowns";
import { useUser } from "@/app/context/UserContext";

// Utility functions for academic years (from your previous demo)
const getCurrentAcademicYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11
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

const FeedbackDashboard = () => {
  const { user, loading: userLoading } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [feedbackType, setFeedbackType] = useState("all");
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
    const fetchFeedbackDashboardData = async () => {
      if (!instituteId || !academicYear) {
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
        if (feedbackType !== "all") params.feedbackType = feedbackType;

        const response = await axios.get("/api/v2/feedback_dashboard", { params });
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching feedback dashboard data:", err);
  setError(err.response?.data?.error || "Failed to load feedback dashboard data");
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    if (instituteId   && academicYear) {
      fetchFeedbackDashboardData();
    }
  }, [instituteId, selectedDepartment, feedbackType, academicYear, userLoading, user?.role]);

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

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const feedbackTypeData = dashboardData?.feedbackTypeDistribution || [];
  const deptData = dashboardData?.departmentDistribution || [];
  const avgRatingsData = dashboardData?.avgRatings?.map((item) => ({
    feedbackTitle: item.feedbackTitle, // Updated to use feedbackTitle
    avgRating: item.avgRating.toFixed(2),
  })) || [];
  const questionsData = dashboardData?.questionsDistribution || [];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Feedback Dashboard</h1>
          <div className="text-sm text-slate-500 mt-2 md:mt-0">
            {academicYear ? `Viewing data for: ${academicYear}` : ""}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
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
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <DepartmentDropdown
                  instituteId={instituteId}
                  onSelect={handleDepartmentSelect}
                  selectedDepartment={selectedDepartment}
                />
              </div>
            )}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Feedback Type</label>
              <Select
                size="sm"
                variant="bordered"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                placeholder="Select Feedback Type"
              >
                <SelectItem key="all" value="all">All Types</SelectItem>
                <SelectItem key="academic" value="academic">Academic</SelectItem>
                <SelectItem key="event" value="event">Event</SelectItem>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-10 flex items-center justify-center h-64">
            <Spinner size="lg" color="primary" />
            <span className="ml-3 text-slate-600">Loading feedback data...</span>
          </div>
        ) : error || !dashboardData ? (
          <div className="bg-white rounded-xl shadow-sm p-10 flex items-center justify-center h-64">
            <div className="text-xl font-medium text-red-600">{error || "Failed to load feedback data"}</div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <MessageSquare size={24} className="text-blue-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Feedbacks</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.totalFeedbacks}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <CheckCircle size={24} className="text-green-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Active Feedbacks</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.activeFeedbacks}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Users size={24} className="text-purple-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Responses</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.totalResponses}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <BarChart2 size={24} className="text-teal-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Response Rate</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardData.responseRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Feedback Type Distribution */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Feedback Type Distribution</h2>
                <div className="h-72">
                  {feedbackTypeData.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={feedbackTypeData}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {feedbackTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      No feedback type data available
                    </div>
                  )}
                </div>
              </div>

              {/* Department Distribution (only for superadmin) */}
              {user.role === "superadmin" && selectedDepartment === "all" && (
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Department Distribution</h2>
                  <div className="h-72">
                    {deptData.length > 0 ? (
                      <ResponsiveContainer>
                        <BarChart data={deptData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="department" />
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

            {/* Average Ratings */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Average Ratings per Feedback</h2>
              <div className="h-72">
                {avgRatingsData.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={avgRatingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="feedbackTitle" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={70} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="avgRating" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    No ratings data available
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

export default FeedbackDashboard;