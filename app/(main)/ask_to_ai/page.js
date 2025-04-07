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
import { FaRobot, FaUser, FaInfoCircle, FaDownload, FaCopy, FaEllipsisV, FaChartBar, FaTable, FaShare } from 'react-icons/fa';
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
    // This would be integrated with a sharing API/service
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
      <Card className="mt-4 overflow-hidden">
        <CardHeader className="flex justify-between items-center bg-gradient-to-r from-purple-600 to-blue-500 text-white">
          <h3 className="text-lg font-medium">Report Data</h3>
          <div className="flex gap-2">
            <Tooltip content="Export as CSV">
              <Button isIconOnly size="sm" color="primary" variant="flat" onClick={() => exportAsCSV(messageId)}>
                <FaTable size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Copy to clipboard">
              <Button isIconOnly size="sm" color="primary" variant="flat" onClick={() => copyToClipboard(messageId, 'table')}>
                <FaCopy size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Download as PDF">
              <Button isIconOnly size="sm" color="primary" variant="flat" onClick={() => downloadAsPDF(messageId, 'table')}>
                <FaDownload size={16} />
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
                <tr className="bg-gray-100">
                  {headers.map((header, idx) => (
                    <th key={idx} className="py-3 px-4 text-left capitalize font-medium text-gray-700">
                      {header.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {headers.map((header, hIdx) => (
                      <td key={hIdx} className="py-3 px-4 border-t border-gray-100">{row[header]}</td>
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
    const colorPalettes = [
      // Vibrant palette
      ['#2563EB', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#6366F1'],
      // Pastel palette
      ['#93C5FD', '#C4B5FD', '#FBCFE8', '#FDE68A', '#A7F3D0', '#A5F3FC', '#DDD6FE'],
      // Corporate palette
      ['#1D4ED8', '#4F46E5', '#7E22CE', '#BE185D', '#0369A1', '#0F766E', '#15803D']
    ];
    
    // Use the corporate palette by default
    const palette = colorPalettes[2];
    
    return Array(count).fill().map((_, i) => palette[i % palette.length]);
  };

  const renderChart = (chart, messageId) => {
    if (!chart) return null;

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          position: 'top',
          labels: {
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 12
            },
            usePointStyle: true,
            padding: 20
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
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          bodyFont: {
            family: 'Inter, system-ui, sans-serif'
          },
          titleFont: {
            family: 'Inter, system-ui, sans-serif'
          }
        }
      }
    };

    if (chart.type === 'bar' || chart.type === 'line') {
      options.scales = {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
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
          borderColor: 'white',
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
      <Card className="mt-4">
        <CardHeader className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-violet-500 text-white">
          <h3 className="text-lg font-medium">Data Visualization</h3>
          <div className="flex gap-2">
            <Tooltip content="Copy to clipboard">
              <Button isIconOnly size="sm" color="primary" variant="flat" onClick={() => copyToClipboard(messageId, 'chart')}>
                <FaCopy size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Download as PDF">
              <Button isIconOnly size="sm" color="primary" variant="flat" onClick={() => downloadAsPDF(messageId, 'chart')}>
                <FaDownload size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Share">
              <Button isIconOnly size="sm" color="primary" variant="flat" onClick={() => shareContent(messageId, 'chart')}>
                <FaShare size={16} />
              </Button>
            </Tooltip>
          </div>
        </CardHeader>
        <CardBody ref={el => chartRefs.current[messageId] = el}>
          <Tabs variant="underlined" aria-label="Chart Options" className="mb-4">
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
        queries: ['Attendance report for CSE', 'Monthly attendance trends', 'Department-wise attendance']
      },
      { 
        title: 'Department Info', 
        description: 'Get detailed information about departments',
        queries: ['List all departments', 'Compare department performance', 'Department enrollment stats']
      },
      { 
        title: 'Event Feedback', 
        description: 'Analyze feedback from events and programs',
        queries: ['Feedback summary for last event', 'Event participation trends', 'Most popular campus events']
      },
      { 
        title: 'Course Analytics', 
        description: 'Get insights about courses and classes',
        queries: ['Course details with classes', 'Most enrolled courses', 'Course completion rates']
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {suggestions.map((suggestion, idx) => (
          <Card key={idx} isPressable onClick={() => {
            setQuestion(suggestion.queries[0]);
            setTimeout(() => handleSubmit(), 100);
          }}>
            <CardBody className="p-5">
              <h3 className="text-lg font-semibold mb-2">{suggestion.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{suggestion.description}</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.queries.map((query, qidx) => (
                  <Chip 
                    key={qidx} 
                    color={['primary', 'secondary', 'success'][qidx % 3]}
                    variant="flat"
                    size="sm"
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
            </CardBody>
          </Card>
        ))}
      </div>
    );
  };

  if (userLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Spinner size="lg" color="primary" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-6"
    >
      <Card className="max-w-5xl mx-auto overflow-hidden shadow-xl">
        <CardHeader className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-violet-600 p-6">
          <div className="flex items-center">
            <Avatar 
              icon={<FaRobot />}
              size="md"
              classNames={{
                icon: "text-primary",
                base: "bg-white"
              }}
            />
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-white">ERP AI Assistant</h1>
              {user && (
                <div className="flex gap-2 mt-1 flex-wrap">
                  {user.subscribedServices?.map((service, idx) => (
                    <Chip key={idx} size="sm" variant="flat" color="primary" classNames={{
                      base: "bg-white/20 text-white",
                      content: "text-xs"
                    }}>
                      {service}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </div>
          {user && (
            <Chip 
              color="default" 
              variant="flat" 
              avatar={<Avatar name={user.name || user.email} size="sm" />}
              classNames={{
                base: "bg-white/20 backdrop-blur-sm",
                content: "text-white"
              }}
            >
              {user.name || user.email} ({user.role})
            </Chip>
          )}
        </CardHeader>

        <div className="bg-gray-50 h-[700px] overflow-y-auto flex flex-col gap-6 p-4 md:p-6" style={{ scrollBehavior: 'smooth' }}>
          {conversation.length === 0 && showGuide && (
            <div className="text-center p-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mb-6">
                <FaInfoCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Welcome to ERP AI Assistant</h2>
              <p className="text-gray-600 mb-6">Ask questions or use one of the suggested queries below.</p>
              
              {/* Render suggestion cards */}
              {renderSuggestionCards()}
              
              {/* Chart type preferences */}
              <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-md font-medium text-gray-800 mb-3">Chart Type Preference</h3>
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
                className={`max-w-[85%] ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600' 
                    : 'bg-white'
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
                        icon={message.type === 'user' ? <FaUser /> : <FaRobot />}
                        size="sm"
                        classNames={{
                          icon: message.type === 'user' ? "text-white" : "text-primary",
                          base: message.type === 'user' ? "bg-white/20" : "bg-primary/10"
                        }}
                      />
                      <span className={`ml-2 font-medium text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-600'}`}>
                        {message.type === 'user' ? 'You' : 'ERP Assistant'}
                      </span>
                    </div>
                    
                    {message.timestamp && (
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        classNames={{
                          base: message.type === 'user' ? "bg-white/10" : "bg-gray-100",
                          content: message.type === 'user' ? "text-white/80 text-xs" : "text-gray-500 text-xs"
                        }}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Chip>
                    )}
                  </div>

                  <p className={`${message.type === 'user' ? 'text-white' : 'text-gray-700'} leading-relaxed`}>
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
              <Card className="max-w-[85%] bg-white" style={{ borderBottomLeftRadius: 0 }}>
                <CardBody className="p-4">
                  <div className="flex items-center">
                    <Avatar 
                      icon={<FaRobot />}
                      size="sm"
                      classNames={{
                        icon: "text-primary",
                        base: "bg-primary/10"
                      }}
                    />
                    <span className="ml-2 font-medium text-sm text-gray-600">ERP Assistant</span>
                  </div>
                  <div className="flex space-x-2 mt-4 pl-3">
                    <Spinner size="sm" color="primary" />
                    <span className="text-sm text-gray-500">Generating response...</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        <CardFooter className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly variant="flat" color="secondary">
                    <FaChartBar />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Chart type options"
                  onAction={(key) => setSelectedChartType(key)}
                >
                  <DropdownItem key="bar" startContent={<FaChartBar />}>Bar Chart</DropdownItem>
                  <DropdownItem key="line" startContent={<FaChartBar />}>Line Chart</DropdownItem>
                  <DropdownItem key="pie" startContent={<FaChartBar />}>Pie Chart</DropdownItem>
                  <DropdownItem key="doughnut" startContent={<FaChartBar />}>Doughnut Chart</DropdownItem>
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
                endContent={
                  <Button 
                    type="submit"
                    color="primary"
                    isLoading={loading}
                    isDisabled={loading || !user || !question.trim()}
                    radius="full"
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-violet-500"
                  >
                    Send
                  </Button>
                }
              />
            </div>
            <div className="flex gap-2 mt-3 text-xs text-gray-500 px-2">
              <Chip size="sm" variant="flat" color="default">Try: "Generate feedback summary"</Chip>
              <Chip size="sm" variant="flat" color="default">Try: "List all departments"</Chip>
              <Chip size="sm" variant="flat" color="default">Try: "Student attendance trends"</Chip>
            </div>
          </form>
        </CardFooter>
      </Card>
    </motion.div>
  );
}