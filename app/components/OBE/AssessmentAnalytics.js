"use client"
import { useState, useEffect, useCallback } from "react"
import { Card, CardBody, CardHeader, Spinner, Divider } from "@nextui-org/react"
import { toast } from "sonner"
import axios from "axios"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Define colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]
const GRADE_COLORS = {
  "A+": "#4CAF50",
  A: "#8BC34A",
  "B+": "#CDDC39",
  B: "#FFEB3B",
  "C+": "#FFC107",
  C: "#FF9800",
  D: "#FF5722",
  F: "#F44336",
}

export default function AssessmentAnalytics({ assessment }) {
  const [studentMarks, setStudentMarks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    average: 0,
    median: 0,
    highest: 0,
    lowest: 0,
    passRate: 0,
    gradeDistribution: [],
    marksDistribution: [],
  })

  // Fetch student marks
  const fetchStudentMarks = useCallback(async () => {
    if (!assessment?._id) return

    setIsLoading(true)
    try {
      const response = await axios.get(`/api/v2/obe/student-marks`, {
        params: { assessmentId: assessment._id },
      })

      if (response.data.success && Array.isArray(response.data.data)) {
        const marks = response.data.data.filter(
          (student) => student.marks !== null && student.marks !== undefined && !isNaN(student.marks),
        )
        setStudentMarks(marks)

        // Calculate analytics if we have marks
        if (marks.length > 0) {
          calculateAnalytics(marks)
        }
      } else {
        setStudentMarks([])
      }
    } catch (error) {
      console.error("Error fetching student marks:", error)
      toast.error("Failed to load student marks for analytics")
      setStudentMarks([])
    } finally {
      setIsLoading(false)
    }
  }, [assessment])

  // Calculate analytics from marks
  const calculateAnalytics = useCallback(
    (marks) => {
      if (!marks.length || !assessment) return

      // Extract numeric marks
      const numericMarks = marks.map((student) => Number(student.marks)).filter((mark) => !isNaN(mark))

      if (numericMarks.length === 0) {
        setAnalytics({
          average: 0,
          median: 0,
          highest: 0,
          lowest: 0,
          passRate: 0,
          gradeDistribution: [],
          marksDistribution: [],
        })
        return
      }

      // Sort marks for calculations
      numericMarks.sort((a, b) => a - b)

      // Calculate basic statistics
      const sum = numericMarks.reduce((acc, mark) => acc + mark, 0)
      const average = sum / numericMarks.length
      const median =
        numericMarks.length % 2 === 0
          ? (numericMarks[numericMarks.length / 2 - 1] + numericMarks[numericMarks.length / 2]) / 2
          : numericMarks[Math.floor(numericMarks.length / 2)]
      const highest = numericMarks[numericMarks.length - 1]
      const lowest = numericMarks[0]

      // Calculate pass rate (assuming 40% is passing)
      const passingThreshold = assessment.maxMarks * 0.4
      const passCount = numericMarks.filter((mark) => mark >= passingThreshold).length
      const passRate = (passCount / numericMarks.length) * 100

      // Calculate grade distribution
      const gradeRanges = [
        { grade: "A+", min: 90, max: 100 },
        { grade: "A", min: 80, max: 89.99 },
        { grade: "B+", min: 70, max: 79.99 },
        { grade: "B", min: 60, max: 69.99 },
        { grade: "C+", min: 50, max: 59.99 },
        { grade: "C", min: 40, max: 49.99 },
        { grade: "D", min: 35, max: 39.99 },
        { grade: "F", min: 0, max: 34.99 },
      ]

      const gradeDistribution = gradeRanges
        .map((range) => {
          const percentage = (mark) => (mark / assessment.maxMarks) * 100
          const count = numericMarks.filter(
            (mark) => percentage(mark) >= range.min && percentage(mark) <= range.max,
          ).length

          return {
            grade: range.grade,
            count,
            percentage: (count / numericMarks.length) * 100,
          }
        })
        .filter((grade) => grade.count > 0)

      // Calculate marks distribution (histogram)
      const maxMark = assessment.maxMarks
      const binSize = maxMark / 10 // 10 bins
      const bins = Array.from({ length: 10 }, (_, i) => ({
        range: `${Math.round(i * binSize)}-${Math.round((i + 1) * binSize)}`,
        min: i * binSize,
        max: (i + 1) * binSize,
        count: 0,
      }))

      numericMarks.forEach((mark) => {
        const binIndex = Math.min(Math.floor(mark / binSize), bins.length - 1)
        bins[binIndex].count++
      })

      const marksDistribution = bins.filter((bin) => bin.count > 0)

      setAnalytics({
        average,
        median,
        highest,
        lowest,
        passRate,
        gradeDistribution,
        marksDistribution,
      })
    },
    [assessment],
  )

  // Load data on mount
  useEffect(() => {
    fetchStudentMarks()
  }, [fetchStudentMarks])

  if (isLoading) {
    return (
      <Card>
        <CardBody className="py-8">
          <div className="flex justify-center">
            <Spinner label="Loading analytics..." />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (studentMarks.length === 0) {
    return (
      <Card>
        <CardBody className="py-8">
          <p className="text-center text-gray-500">
            No student marks available for analytics. Please add student marks first.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Performance Summary</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-xl font-bold">{analytics.average.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{((analytics.average / assessment.maxMarks) * 100).toFixed(1)}%</p>
            </div>

            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Median</p>
              <p className="text-xl font-bold">{analytics.median.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{((analytics.median / assessment.maxMarks) * 100).toFixed(1)}%</p>
            </div>

            <div className="bg-success-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Highest</p>
              <p className="text-xl font-bold">{analytics.highest.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{((analytics.highest / assessment.maxMarks) * 100).toFixed(1)}%</p>
            </div>

            <div className="bg-warning-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Lowest</p>
              <p className="text-xl font-bold">{analytics.lowest.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{((analytics.lowest / assessment.maxMarks) * 100).toFixed(1)}%</p>
            </div>

            <div className="bg-secondary-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Pass Rate</p>
              <p className="text-xl font-bold">{analytics.passRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Threshold: {(assessment.maxMarks * 0.4).toFixed(1)} marks</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Grade Distribution</h3>
          </CardHeader>
          <CardBody>
            {analytics.gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.gradeDistribution}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ grade, percentage }) => `${grade} (${percentage.toFixed(1)}%)`}
                  >
                    {analytics.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} students`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-10">No grade data available</p>
            )}
          </CardBody>
        </Card>

        {/* Marks Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Marks Distribution</h3>
          </CardHeader>
          <CardBody>
            {analytics.marksDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.marksDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} students`, "Count"]} />
                  <Legend />
                  <Bar dataKey="count" name="Students" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-10">No distribution data available</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* CO Achievement Analysis */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Course Outcome Achievement</h3>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-500 mb-4">
            This analysis shows the average achievement level for each Course Outcome mapped to this assessment.
          </p>

          {Array.isArray(assessment.coMapping) && assessment.coMapping.length > 0 ? (
            <div className="space-y-4">
              {assessment.coMapping.map((mapping, index) => {
                // Calculate achievement for this CO
                const coMaxMarks = mapping.maxMarks
                const totalAchieved = studentMarks.reduce((sum, student) => {
                  // Calculate proportional marks for this CO
                  const proportion = coMaxMarks / assessment.maxMarks
                  return sum + student.marks * proportion
                }, 0)

                const averageAchieved = totalAchieved / studentMarks.length
                const achievementPercentage = (averageAchieved / coMaxMarks) * 100

                // Determine achievement level
                let achievementLevel = "Low"
                let colorClass = "text-danger"

                if (achievementPercentage >= 70) {
                  achievementLevel = "High"
                  colorClass = "text-success"
                } else if (achievementPercentage >= 50) {
                  achievementLevel = "Medium"
                  colorClass = "text-warning"
                }

                return (
                  <div key={`co-achievement-${index}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-medium">CO{mapping.coIndex}</span>
                        <span className="text-gray-500 ml-2">({mapping.maxMarks} marks)</span>
                      </div>
                      <div className={colorClass}>
                        {achievementPercentage.toFixed(1)}% - {achievementLevel}
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          achievementPercentage >= 70
                            ? "bg-success"
                            : achievementPercentage >= 50
                              ? "bg-warning"
                              : "bg-danger"
                        }`}
                        style={{ width: `${Math.min(100, achievementPercentage)}%` }}
                      ></div>
                    </div>

                    {index < assessment.coMapping.length - 1 && <Divider className="my-3" />}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No course outcomes mapped to this assessment</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
