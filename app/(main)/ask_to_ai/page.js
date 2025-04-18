"use client";
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/app/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Tabs, Tab } from '@nextui-org/react';
import { Bot, Send, BarChart2, Sun, Moon, User, Loader2, MessageSquare } from 'lucide-react';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function AskToAI() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const { user, loading: userLoading } = useUser();
  const messageEndRef = useRef(null);
  const chartRefs = useRef({});
  const tableRefs = useRef({});

  useEffect(() => {
    if (messageEndRef.current) messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!user || userLoading || !question.trim()) return;

    const userMessage = question;
    setConversation(prev => [...prev, { type: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setLoading(true);
    setQuestion('');

    try {
      const res = await fetch('http://localhost:8000/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          userRole: user.role,
          subscribedServices: user.subscribedServices || [],
          instituteId: user.role === 'superadmin' ? user._id : user?.institute?._id,
          departmentId: user?.department?._id || undefined,
          preferredChartType: selectedChartType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setConversation(prev => [...prev, {
          id: `resp-${Date.now()}`,
          type: 'ai',
          content: `Sorry, I couldn’t process your request: ${data.error || res.statusText}. Please try rephrasing your query.`,
          timestamp: new Date().toISOString(),
        }]);
        return;
      }

      const result = data.result || {};
      setConversation(prev => [...prev, {
        id: `resp-${Date.now()}`,
        type: 'ai',
        content: result.answer || "No response received from the server.",
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        report: result.report || null,
        chart: result.chart || null,
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      setConversation(prev => [...prev, {
        id: `resp-${Date.now()}`,
        type: 'ai',
        content: `An unexpected error occurred: ${error.message}. Please try again later.`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderReport = (report, messageId) => {
    if (!report || !Array.isArray(report) || report.length === 0) return null;
    const headers = Object.keys(report[0]);

    return (
      <Card className="mt-4">
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Report Data</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="flat" color="secondary" onClick={() => exportAsCSV(messageId)}>
              Export CSV
            </Button>
            <Button size="sm" variant="flat" color="secondary" onClick={() => downloadAsPDF(messageId, 'table')}>
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table ref={el => tableRefs.current[messageId] = el} className="w-full text-sm">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  {headers.map((header, idx) => (
                    <th key={idx} className="px-4 py-2 text-left capitalize">{header.replace(/([A-Z])/g, ' $1')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                    {headers.map((header, hIdx) => (
                      <td key={hIdx} className="px-4 py-2">{row[header] ?? 'N/A'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderChart = (chart, messageId) => {
    if (!chart || !chart.labels || !chart.datasets) return null;

    const chartComponents = {
      bar: Bar,
      line: Line,
      pie: Pie,
      doughnut: Doughnut,
    };

    const ChartComponent = chartComponents[chart.type] || Bar;

    return (
      <Card className="mt-4">
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Data Visualization</h3>
          <Button size="sm" variant="flat" color="secondary" onClick={() => downloadAsPDF(messageId, 'chart')}>
            Download PDF
          </Button>
        </CardHeader>
        <CardBody ref={el => chartRefs.current[messageId] = el} className="h-80">
          <ChartComponent
            data={chart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } }
            }}
          />
        </CardBody>
      </Card>
    );
  };

  const renderSuggestions = (suggestions) => {
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) return null;
    return (
      <Card className="mt-4">
        <CardHeader>
          <h3 className="text-lg font-semibold">Try These Questions</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="flat"
                color="primary"
                onClick={() => {
                  setQuestion(suggestion);
                  setTimeout(() => handleSubmit(), 100);
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  };

  const downloadAsPDF = async (messageId, type) => {
    const element = type === 'chart' ? chartRefs.current[messageId] : tableRefs.current[messageId];
    if (!element) {
      toast.error('Element not found for export');
      return;
    }

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdf.internal.pageSize.getWidth() / imgWidth, pdf.internal.pageSize.getHeight() / imgHeight);
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${type}-export-${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} downloaded as PDF`);
    } catch (error) {
      toast.error(`Failed to download ${type}: ${error.message}`);
    }
  };

  const exportAsCSV = (messageId) => {
    const table = tableRefs.current[messageId];
    if (!table) {
      toast.error('Table not found for export');
      return;
    }

    try {
      const rows = Array.from(table.querySelectorAll('tr'));
      const csv = rows.map(row =>
        Array.from(row.querySelectorAll('th, td'))
          .map(cell => `"${cell.textContent.replace(/"/g, '""')}"`)
          .join(',')
      ).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-export-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Table exported as CSV');
    } catch (error) {
      toast.error(`Failed to export CSV: ${error.message}`);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  if (userLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen p-4 md:p-6 bg-gray-100 dark:bg-gray-900 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
    >
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="flex justify-between items-center p-6">
          <div className="flex items-center gap-4">
            <Avatar icon={<Bot size={24} />} color="primary" radius="full" />
            <div>
              <h1 className="text-2xl font-bold">ERP AI Assistant</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Gemini & MCP</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button isIconOnly size="sm" variant="ghost" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
            {user && (
              <Avatar name={user.name?.[0] || user.email?.[0]} size="sm" color="primary" radius="full" />
            )}
          </div>
        </CardHeader>

        <CardBody className="h-[600px] overflow-y-auto p-6">
          {conversation.length === 0 && (
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold">Start a Conversation</h2>
              <p className="text-gray-500 dark:text-gray-400">Ask about reports, analytics, or anything else!</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
                  { title: 'Attendance Report', query: 'Attendance report for subject CS101' },
                  { title: 'Student List', query: 'List all students in class BE 2024-2025' },
                  { title: 'Class List', query: 'Show all classes in CSE department 2024-2025' },
                  { title: 'Course Details', query: 'List subjects in class BE' },
                ].map((s, idx) => (
                  <Card
                    key={idx}
                    isPressable
                    onPress={() => {
                      setQuestion(s.query);
                      setTimeout(() => handleSubmit(), 100);
                    }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <CardBody>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{s.query}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {conversation.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <Card
                  className={`max-w-[80%] shadow-sm ${message.type === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}`}
                >
                  <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar
                        icon={message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                        size="sm"
                        color={message.type === 'user' ? 'default' : 'primary'}
                      />
                      <span className="text-sm font-medium">{message.type === 'user' ? 'You' : 'ERP Assistant'}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p>{message.content}</p>
                    {renderSuggestions(message.suggestions)}
                    {renderReport(message.report, message.id)}
                    {renderChart(message.chart, message.id)}
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <Card className="max-w-[80%] bg-white dark:bg-gray-800 shadow-sm">
                <CardBody className="p-4">
                  <div className="flex items-center gap-2">
                    <Avatar icon={<Bot size={16} />} size="sm" color="primary" />
                    <span className="text-sm font-medium">ERP Assistant</span>
                  </div>
                  <Loader2 className="animate-spin mt-2 text-primary" size={20} />
                </CardBody>
              </Card>
            </motion.div>
          )}
          <div ref={messageEndRef} />
        </CardBody>

        <CardFooter className="p-4 bg-gray-50 dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="ghost" color="primary">
                  <BarChart2 size={20} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu onAction={key => setSelectedChartType(key)} variant="flat">
                <DropdownItem key="bar">Bar Chart</DropdownItem>
                <DropdownItem key="line">Line Chart</DropdownItem>
                <DropdownItem key="pie">Pie Chart</DropdownItem>
                <DropdownItem key="doughnut">Doughnut Chart</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={user ? "Ask anything..." : "Please log in to ask questions"}
              disabled={loading || !user}
              className="flex-grow"
              variant="bordered"
            />
            <Button
              type="submit"
              isLoading={loading}
              disabled={loading || !question.trim()}
              color="primary"
              className="min-w-[40px]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </motion.div>
  );
}