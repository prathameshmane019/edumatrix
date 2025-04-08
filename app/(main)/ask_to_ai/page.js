"use client";
import { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Tooltip,
  Spinner,
  Tabs,
  Tab
} from "@nextui-org/react";
import { 
  MessageCircle, 
  User, 
  Info, 
  Download, 
  Copy, 
  MoreVertical, 
  BarChart, 
  Table, 
  Share,
  Send,
  PieChart,
  LineChart,
  Bot
} from 'lucide-react';
import { useUser } from '@/app/context/UserContext';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, ChartTooltip, Legend);

export default function AskToAI() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading } = useUser();
  const [selectedAction, setSelectedAction] = useState(null);
  const messageEndRef = useRef(null);
  const chartRefs = useRef({});
  const tableRefs = useRef({});
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [showGuide, setShowGuide] = useState(true);
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!user || userLoading || !question.trim()) return;

    const userMessage = question;
    setConversation(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);
    setQuestion('');
    setShowGuide(false);

    try {
      const res = await fetch('/api/v2/ask_to_ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          userRole: user.role,
          subscribedServices: user.subscribedServices || [],
          instituteId: user.role === 'superadmin' ? user._id : user?.institute?._id,
          preferredChartType: selectedChartType
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();

      setConversation(prev => [...prev, { 
        id: `resp-${Date.now()}`,
        type: 'ai', 
        content: data.answer, 
        report: data.report, 
        chart: data.chart,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error fetching answer:', error);
      setConversation(prev => [...prev, { 
        type: 'ai', 
        content: 'An error occurred. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = async (messageId, type) => {
    const element = type === 'chart' ? chartRefs.current[messageId] : tableRefs.current[messageId];
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${type === 'chart' ? 'chart' : 'table'}-export-${new Date().toISOString().slice(0,10)}.pdf`);
      
      toast.success(`${type === 'chart' ? 'Chart' : 'Table'} successfully downloaded as PDF`);
    } catch (error) {
      toast.error(`Failed to download as PDF: ${error.message}`);
    }
  };

  const copyToClipboard = async (messageId, type) => {
    try {
      if (type === 'chart') {
        const canvas = await html2canvas(chartRefs.current[messageId]);
        canvas.toBlob(blob => {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
            toast.success('Chart copied to clipboard!');
          });
        });
      } else {
        // For table, create a simple text representation
        const table = tableRefs.current[messageId];
        const rows = Array.from(table.querySelectorAll('tr'));
        const text = rows.map(row => 
          Array.from(row.querySelectorAll('th, td'))
            .map(cell => cell.textContent)
            .join('\t')
        ).join('\n');
        
        await navigator.clipboard.writeText(text);
        toast.success('Table copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareContent = (messageId, type) => {
    toast.success(`Share functionality will be integrated with your system's sharing API`);
  };

  const exportAsCSV = (messageId) => {
    try {
      const table = tableRefs.current[messageId];
      const rows = Array.from(table.querySelectorAll('tr'));
      
      const csvContent = rows.map(row => 
        Array.from(row.querySelectorAll('th, td'))
          .map(cell => `"${cell.textContent.replace(/"/g, '""')}"`)
          .join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `table-export-${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Table exported as CSV');
    } catch (error) {
      toast.error(`Failed to export as CSV: ${error.message}`);
    }
  };

  const renderReport = (report, messageId) => {
    if (!report || !Array.isArray(report) || report.length === 0) return null;

    const headers = Object.keys(report[0]);
    return (
      <Card className="mt-4 overflow-hidden shadow-md">
        <CardHeader className={`flex justify-between items-center ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
          <h3 className="text-lg font-medium">Report Data</h3>
          <div className="flex gap-2">
            <Tooltip content="Export as CSV">
              <Button isIconOnly size="sm" variant="flat" onClick={() => exportAsCSV(messageId)}>
                <Table size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Copy to clipboard">
              <Button isIconOnly size="sm" variant="flat" onClick={() => copyToClipboard(messageId, 'table')}>
                <Copy size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Download as PDF">
              <Button isIconOnly size="sm" variant="flat" onClick={() => downloadAsPDF(messageId, 'table')}>
                <Download size={16} />
              </Button>
            </Tooltip>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table 
              ref={el => tableRefs.current[messageId] = el}
              className="w-full"
            >
              <thead>
                <tr className={theme === 'dark' ? 'bg-zinc-700' : 'bg-slate-50'}>
                  {headers.map((header, idx) => (
                    <th key={idx} className={`py-3 px-4 text-left capitalize font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {header.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 
                    ? (theme === 'dark' ? 'bg-zinc-800' : 'bg-white') 
                    : (theme === 'dark' ? 'bg-zinc-750' : 'bg-slate-50')
                  }>
                    {headers.map((header, hIdx) => (
                      <td key={hIdx} className={`py-3 px-4 border-t ${theme === 'dark' ? 'border-zinc-700 text-gray-300' : 'border-gray-100 text-gray-700'}`}>
                        {row[header]}
                      </td>
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

  const generateChartColors = (count) => {
    const colorPalettes = {
      light: [
        // Professional light theme palette
        ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#0ea5e9', '#06b6d4', '#10b981'],
        // Pastel palette
        ['#93c5fd', '#a5b4fc', '#c4b5fd', '#ddd6fe', '#bae6fd', '#99f6e4', '#a7f3d0']
      ],
      dark: [
        // Professional dark theme palette
        ['#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#38bdf8', '#22d3ee', '#34d399'],
        // Darker palette
        ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#0ea5e9', '#06b6d4', '#10b981']
      ]
    };
    
    // Use the primary professional palette
    const palette = colorPalettes[theme][0];
    
    return Array(count).fill().map((_, i) => palette[i % palette.length]);
  };

  const renderChart = (chart, messageId) => {
    if (!chart) return null;

    const textColor = theme === 'dark' ? 'white' : '#1e293b';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      color: textColor,
      plugins: { 
        legend: { 
          position: 'top',
          labels: {
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 12
            },
            usePointStyle: true,
            padding: 20,
            color: textColor
          }
        }, 
        title: { 
          display: true, 
          text: `${chart.type === 'bar' ? 'Attendance Report' : 'Department Distribution'}`,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 16,
            weight: 'bold'
          },
          color: textColor,
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
          titleColor: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
          bodyColor: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
          padding: 12,
          bodyFont: {
            family: 'Inter, system-ui, sans-serif'
          },
          titleFont: {
            family: 'Inter, system-ui, sans-serif'
          },
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1
        }
      }
    };

    if (chart.type === 'bar' || chart.type === 'line') {
      options.scales = {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: textColor
          }
        }
      };
    }

    // Apply colorful palettes to charts
    if ((chart.type === 'bar' || chart.type === 'line') && chart.datasets) {
      const colors = generateChartColors(chart.datasets.length);
      chart.datasets = chart.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: chart.type === 'bar' ? colors[index % colors.length] + '80' : 'transparent',
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        hoverBackgroundColor: colors[index % colors.length],
        pointBackgroundColor: chart.type === 'line' ? colors[index % colors.length] : undefined,
        pointHoverBackgroundColor: chart.type === 'line' ? colors[index % colors.length] : undefined,
        pointRadius: chart.type === 'line' ? 4 : undefined,
        tension: chart.type === 'line' ? 0.3 : undefined
      }));
    } else if ((chart.type === 'pie' || chart.type === 'doughnut') && chart.datasets) {
      chart.datasets = chart.datasets.map(dataset => {
        const dataCount = dataset.data.length;
        const colors = generateChartColors(dataCount);
        
        return {
          ...dataset,
          backgroundColor: colors,
          borderColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'white',
          borderWidth: 2,
          hoverOffset: 10
        };
      });
    }

    // Create tabs for different chart visualizations
    const chartTypes = ['bar', 'line', 'pie', 'doughnut'];
    const chartComponents = {
      bar: <Bar data={{...chart, type: 'bar'}} options={options} />,
      line: <Line data={{...chart, type: 'line'}} options={options} />,
      pie: <Pie data={{...chart, type: 'pie'}} options={options} />,
      doughnut: <Doughnut data={{...chart, type: 'doughnut'}} options={options} />
    };

    return (
      <Card className="mt-4 shadow-md">
        <CardHeader className={`flex justify-between items-center ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
          <h3 className="text-lg font-medium">Data Visualization</h3>
          <div className="flex gap-2">
            <Tooltip content="Copy to clipboard">
              <Button isIconOnly size="sm" variant="flat" onClick={() => copyToClipboard(messageId, 'chart')}>
                <Copy size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Download as PDF">
              <Button isIconOnly size="sm" variant="flat" onClick={() => downloadAsPDF(messageId, 'chart')}>
                <Download size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Share">
              <Button isIconOnly size="sm" variant="flat" onClick={() => shareContent(messageId, 'chart')}>
                <Share size={16} />
              </Button>
            </Tooltip>
          </div>
        </CardHeader>
        <CardBody className={theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} ref={el => chartRefs.current[messageId] = el}>
          <Tabs 
            variant="underlined" 
            aria-label="Chart Options" 
            className="mb-4"
            classNames={{
              tabList: theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-50',
              cursor: theme === 'dark' ? 'bg-blue-500' : 'bg-blue-500',
              tab: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
              tabContent: theme === 'dark' ? 'group-data-[selected=true]:text-blue-400' : 'group-data-[selected=true]:text-blue-600'
            }}
          >
            {chartTypes.map((type) => (
              <Tab key={type} title={type.charAt(0).toUpperCase() + type.slice(1)}>
                <div className="h-80 w-full py-4">
                  {chartComponents[type]}
                </div>
              </Tab>
            ))}
          </Tabs>
        </CardBody>
      </Card>
    );
  };

  const renderSuggestionCards = () => {
    const suggestions = [
      { 
        title: 'Attendance Analytics', 
        description: 'View attendance reports by department or course',
        queries: ['Attendance report for CSE', 'Monthly attendance trends', 'Department-wise attendance'],
        icon: <BarChart className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={24} />
      },
      { 
        title: 'Department Info', 
        description: 'Get detailed information about departments',
        queries: ['List all departments', 'Compare department performance', 'Department enrollment stats'],
        icon: <PieChart className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} size={24} />
      },
      { 
        title: 'Event Feedback', 
        description: 'Analyze feedback from events and programs',
        queries: ['Feedback summary for last event', 'Event participation trends', 'Most popular campus events'],
        icon: <MessageCircle className={theme === 'dark' ? 'text-violet-400' : 'text-violet-600'} size={24} />
      },
      { 
        title: 'Course Analytics', 
        description: 'Get insights about courses and classes',
        queries: ['Course details with classes', 'Most enrolled courses', 'Course completion rates'],
        icon: <LineChart className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} size={24} />
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {suggestions.map((suggestion, idx) => (
          <Card 
            key={idx} 
            isPressable 
            onClick={() => {
              setQuestion(suggestion.queries[0]);
              setTimeout(() => handleSubmit(), 100);
            }}
            className={theme === 'dark' ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-slate-100'}
          >
            <CardBody className="p-5">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-700' : 'bg-slate-100'}`}>
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {suggestion.title}
                  </h3>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {suggestion.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.queries.map((query, qidx) => (
                      <Chip 
                        key={qidx} 
                        variant="flat"
                        size="sm"
                        color={theme === 'dark' ? 'primary' : 'default'}
                        className={theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : ''}
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuestion(query);
                          setTimeout(() => handleSubmit(), 100);
                        }}
                      >
                        {query}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (userLoading) return (
    <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-zinc-900' : 'bg-slate-50'}`}>
      <Spinner size="lg" color="primary" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className={`min-h-screen p-4 md:p-6 ${
        theme === 'dark' 
          ? 'bg-zinc-900' 
          : 'bg-slate-100'
      }`}
    >
      <Card className="max-w-5xl mx-auto overflow-hidden shadow-xl">
        <CardHeader className={`flex justify-between items-center p-6 ${
          theme === 'dark' 
            ? 'bg-zinc-800 text-white' 
            : 'bg-slate-700 text-white'
        }`}>
          <div className="flex items-center">
            <Avatar 
              icon={<Bot />}
              size="md"
              classNames={{
                icon: theme === 'dark' ? "text-blue-300" : "text-blue-600",
                base: theme === 'dark' ? "bg-zinc-700" : "bg-white"
              }}
            />
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-white">ERP AI Assistant</h1>
              {user && (
                <div className="flex gap-2 mt-1 flex-wrap">
                  {user.subscribedServices?.map((service, idx) => (
                    <Chip key={idx} size="sm" variant="flat" color="primary" classNames={{
                      base: theme === 'dark' ? "bg-blue-900/30 text-blue-300" : "bg-white/20 text-white",
                      content: "text-xs"
                    }}>
                      {service}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              variant="flat" 
              onClick={toggleTheme}
              className={theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-slate-600 text-white'}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            {user && (
              <Chip 
                color="default" 
                variant="flat" 
                avatar={<Avatar name={user.name || user.email} size="sm" />}
                classNames={{
                  base: theme === 'dark' ? "bg-zinc-700" : "bg-white/20 backdrop-blur-sm",
                  content: "text-white"
                }}
              >
                {user.name || user.email} ({user.role})
              </Chip>
            )}
          </div>
        </CardHeader>

        <div className={`h-[700px] overflow-y-auto flex flex-col gap-6 p-4 md:p-6 ${
          theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'
        }`} style={{ scrollBehavior: 'smooth' }}>
          {conversation.length === 0 && showGuide && (
            <div className="text-center p-8">
              <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 ${
                theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'
              }`}>
                <Info className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Welcome to ERP AI Assistant
              </h2>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Ask questions or use one of the suggested queries below.
              </p>
              
              {/* Render suggestion cards */}
              {renderSuggestionCards()}
              
              {/* Chart type preferences */}
              <div className={`mt-6 p-4 rounded-xl shadow-sm ${
                theme === 'dark' ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-gray-100'
              }`}>
                <h3 className={`text-md font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Chart Type Preference
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['bar', 'line', 'pie', 'doughnut'].map((type) => (
                    <Chip
                      key={type}
                      color={selectedChartType === type ? "primary" : "default"}
                      variant={selectedChartType === type ? "solid" : "bordered"}
                      onClick={() => setSelectedChartType(type)}
                      className="cursor-pointer"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {conversation.map((message, idx) => (
            <div key={idx} 
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card 
                className={`max-w-[85%] shadow-md ${
                  message.type === 'user' 
                    ? theme === 'dark' ? 'bg-blue-900' : 'bg-blue-600' 
                    : theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
                }`}
                style={{
                  borderBottomRightRadius: message.type === 'user' ? 0 : undefined,
                  borderBottomLeftRadius: message.type === 'ai' ? 0 : undefined,
                }}
              >
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Avatar 
                        icon={message.type === 'user' ? <User /> : <Bot />}
                        size="sm"
                        classNames={{
                          icon: message.type === 'user' ? "text-white" : theme === 'dark' ? "text-blue-400" : "text-blue-600",
                          base: message.type === 'user' 
                            ? "bg-white/20" 
                            : theme === 'dark' ? "bg-zinc-700" : "bg-blue-100"
                        }}
                      />
                      <span className={`ml-2 font-medium text-sm ${
                        message.type === 'user' 
                          ? 'text-white' 
                          : theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                      }`}>
                        {message.type === 'user' ? 'You' : 'ERP Assistant'}
                      </span>
                    </div>
                    
                    {message.timestamp && (
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        classNames={{
                          base: message.type === 'user' 
                            ? "bg-white/10" 
                            : theme === 'dark' ? "bg-zinc-700" : "bg-gray-100",
                          content: message.type === 'user' 
                            ? "text-white/80 text-xs" 
                            : theme === 'dark' ? "text-gray-300 text-xs" : "text-gray-500 text-xs"
                        }}
                      >
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Chip>
                    )}
                  </div>

                  <p className={`${
                    message.type === 'user' 
                      ? 'text-white' 
                      : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  } leading-relaxed`}>
                    {message.content}
                  </p>
                  
                  {message.type === 'ai' && message.report && renderReport(message.report, message.id)}
                  {message.type === 'ai' && message.chart && renderChart(message.chart, message.id)}
                </CardBody>
              </Card>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <Card className={`max-w-[85%] ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}`} style={{ borderBottomLeftRadius: 0 }}>
                <CardBody className="p-4">
                  <div className="flex items-center">
                    <Avatar 
                      icon={<Bot />}
                      size="sm"
                      classNames={{
                        icon: theme === 'dark' ? "text-blue-400" : "text-blue-600",
                        base: theme === 'dark' ? "bg-zinc-700" : "bg-blue-100"
                      }}
                    />
                    <span className={`ml-2 font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                      ERP Assistant
                    </span>
                  </div>
                  <div className="flex space-x-2 mt-4 pl-3">
                    <Spinner size="sm" color="primary" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Generating response...
                    </span>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        <CardFooter className={`p-4 border-t ${
          theme === 'dark' 
            ? 'border-zinc-700 bg-zinc-800' 
            : 'border-gray-200 bg-white'
        }`}>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    isIconOnly 
                    variant="flat" 
                    className={theme === 'dark' ? 'bg-zinc-700 text-gray-200' : ''}
                  >
                    <BarChart size={18} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Chart type options"
                  onAction={(key) => setSelectedChartType(key)}
                  className={theme === 'dark' ? 'bg-zinc-800 text-gray-200' : ''}
                >
                  <DropdownItem key="bar" startContent={<BarChart size={16} />}>Bar Chart</DropdownItem>
                  <DropdownItem key="line" startContent={<LineChart size={16} />}>Line Chart</DropdownItem>
                  <DropdownItem key="pie" startContent={<PieChart size={16} />}>Pie Chart</DropdownItem>
                  <DropdownItem key="doughnut" startContent={<PieChart size={16} />}>Doughnut Chart</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={user ? "Ask about reports, charts, or anything else..." : "Please log in to use the assistant"}
                disabled={loading || !user}
                className="flex-grow"
                size="lg"
                radius="lg"
                classNames={{
                  inputWrapper: theme === 'dark' ? 'bg-zinc-700 border-zinc-600' : 'bg-white'
                }}
                endContent={
                  <Button 
                    type="submit"
                    isLoading={loading}
                    isDisabled={loading || !user || !question.trim()}
                    radius="full"
                    size="sm"
                    className={theme === 'dark' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  >
                    {!loading && <Send size={16} />}
                    {loading ? '' : 'Send'}
                  </Button>
                }
              />
            </div>
            <div className="flex gap-2 mt-3 text-xs px-2">
              <Chip 
                size="sm" 
                variant="flat" 
                className={theme === 'dark' ? 'bg-zinc-700 text-gray-300' : ''}
              >
                Try: "Generate feedback summary"
              </Chip>
              <Chip 
                size="sm" 
                variant="flat" 
                className={theme === 'dark' ? 'bg-zinc-700 text-gray-300' : ''}
              >
                Try: "List all departments"
              </Chip>
              <Chip 
                size="sm" 
                variant="flat" 
                className={theme === 'dark' ? 'bg-zinc-700 text-gray-300' : ''}
              >
                Try: "Student attendance trends"
              </Chip>
            </div>
          </form>
        </CardFooter>
      </Card>
    </motion.div>
  );
}