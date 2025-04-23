"use client"
import { useState, useEffect, useCallback } from "react"
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Tabs,
  Tab,
  Progress,
} from "@nextui-org/react"
import { toast } from "sonner"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function AssessmentAnalytics({ assessment }) {
  const [isLoading, setIsLoading] = useState(false)
  const [studentData, setStudentData] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    evaluated: 0,
    average: 0,
    highest: 0,
    lowest: 0,
    passRate: 0,
    distribution: []
  })

  // Fetch student marks for this assessment
  const fetchStudentMarks = useCallback(async () => {
    if (!assessment?._id) return

    setIsLoading(true)
    try {
      const response = await axios.get(`/api/v2/obe/student-marks`, {
        params: { assessmentId: assessment._id },
      })

      if (response.data.success && Array.isArray(response.data.data)) {
        setStudentData(response.data.data)
        calculateStats(response.data.data)
      } else {
        setStudentData([])
        resetStats()
      }
    } catch (error) {
      console.error("Error fetching student marks:", error)
      toast.error("Failed to load student marks")
      setStudentData([])
      resetStats()
    } finally {
      setIsLoading(false)
    }
  }, [assessment])

  // Calculate statistics from student marks
  const calculateStats = useCallback((data) => {
    // Filter out students with no marks
    const evaluatedStudents = data.filter(student => student.marks !== null && student.marks !== "")
    
    if (evaluatedStudents.length === 0) {
      resetStats()
      return
    }

    const marks = evaluatedStudents.map(student => student.marks)
    const total = data.length
    const evaluated = evaluatedStudents.length
    const average = marks.reduce((sum, mark) => sum + mark, 0) / evaluated
    const highest = Math.max(...marks)
    const lowest = Math.min(...marks)
    
    // Assume passing is 40% of max marks (adjust as needed)
    const passingMark = assessment?.maxMarks * 0.4 || 0
    const passCount = evaluatedStudents.filter(student => student.marks >= passingMark).length
    const passRate = evaluated > 0 ? (passCount / evaluated) * 100 : 0

    // Create distribution buckets (0-20%, 21-40%, etc.)
    const maxMarks = assessment?.maxMarks || 100
    const bucketSize = maxMarks / 5
    const distribution = [
      { name: '0-20%', count: 0, color: '#ef4444' },
      { name: '21-40%', count: 0, color: '#f97316' },
      { name: '41-60%', count: 0, color: '#facc15' },
      { name: '61-80%', count: 0, color: '#84cc16' },
      { name: '81-100%', count: 0, color: '#22c55e' }
    ]

    evaluatedStudents.forEach(student => {
      const percentage = (student.marks / maxMarks) * 100
      const bucketIndex = Math.min(Math.floor(percentage / 20), 4)
      distribution[bucketIndex].count++
    })

    setStats({
      total,
      evaluated,
      average,
      highest,
      lowest,
      passRate,
      distribution
    })
  }, [assessment])

  // Reset stats to default values
  const resetStats = useCallback(() => {
    setStats({
      total: 0,
      evaluated: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      passRate: 0,
      distribution: [
        { name: '0-20%', count: 0, color: '#ef4444' },
        { name: '21-40%', count: 0, color: '#f97316' },
        { name: '41-60%', count: 0, color: '#facc15' },
        { name: '61-80%', count: 0, color: '#84cc16' },
        { name: '81-100%', count: 0, color: '#22c55e' }
      ]
    })
  }, [])

  // Load student marks when assessment changes
  useEffect(() => {
    if (assessment?._id) {
      fetchStudentMarks()
    } else {
      setStudentData([])
      resetStats()
    }
  }, [assessment, fetchStudentMarks, resetStats])

  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-md">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-sm">{`Count: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  if (!assessment) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-500">Please select an assessment to view analytics</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Assessment Analytics</h3>
      </CardHeader>

      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner label="Loading analytics..." />
          </div>
        ) : (
          <>
            {/* Overview Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card shadow="sm">
                <CardBody className="p-4">
                  <p className="text-sm text-gray-500">Total Students</p>
                  <h4 className="text-2xl font-bold">{stats.total}</h4>
                  <p className="text-xs text-gray-500">
                    {stats.evaluated} evaluated ({Math.round((stats.evaluated / stats.total) * 100) || 0}%)
                  </p>
                </CardBody>
              </Card>
              
              <Card shadow="sm">
                <CardBody className="p-4">
                  <p className="text-sm text-gray-500">Average Score</p>
                  <h4 className="text-2xl font-bold">
                    {stats.average.toFixed(1)}
                    <span className="text-sm text-gray-500"> / {assessment.maxMarks}</span>
                  </h4>
                  <Progress 
                    aria-label="Average Score" 
                    value={(stats.average / assessment.maxMarks) * 100} 
                    className="mt-2"
                    color="primary"
                  />
                </CardBody>
              </Card>
              
              <Card shadow="sm">
                <CardBody className="p-4">
                  <p className="text-sm text-gray-500">Pass Rate</p>
                  <h4 className="text-2xl font-bold">{stats.passRate.toFixed(1)}%</h4>
                  <Progress 
                    aria-label="Pass Rate" 
                    value={stats.passRate} 
                    className="mt-2"
                    color={stats.passRate >= 70 ? "success" : stats.passRate >= 40 ? "warning" : "danger"}
                  />
                </CardBody>
              </Card>
            </div>
            
            <Divider className="my-4" />
            
            {/* Charts */}
            <Tabs aria-label="Analytics Charts">
              <Tab key="distribution" title="Score Distribution">
                <div className="py-4">
                  <h4 className="text-md font-medium mb-4">Score Distribution</h4>
                  
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Students">
                          {stats.distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Tab>
              
              <Tab key="pie" title="Percentage View">
                <div className="py-4">
                  <h4 className="text-md font-medium mb-4">Score Distribution (Percentage)</h4>
                  
                  <div className="h-72 flex justify-center">
                    <ResponsiveContainer width="80%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.distribution.filter(item => item.count > 0)}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Tab>
            </Tabs>
            
            {/* Additional stats */}
            <Divider className="my-4" />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Highest Score</p>
                <p className="font-semibold">{stats.highest} / {assessment.maxMarks}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Lowest Score</p>
                <p className="font-semibold">{stats.lowest} / {assessment.maxMarks}</p>
              </div>
            </div>
            
            {stats.total === 0 && (
              <div className="text-center py-8 text-gray-500">
                No student data available. Add student marks to view analytics.
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  )
}