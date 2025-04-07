"use client";
import { useState, useRef, useEffect } from 'react';
import { FaSpinner, FaRobot, FaUser, FaInfoCircle, FaDownload, FaCopy, FaEllipsisH } from 'react-icons/fa';
import { useUser } from '@/app/context/UserContext';
import { motion } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function AskToAI() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading } = useUser();
  const [showOptions, setShowOptions] = useState(null);
  const messageEndRef = useRef(null);
  const chartRefs = useRef({});
  const tableRefs = useRef({});

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

    try {
      const res = await fetch('/api/v2/ask_to_ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          userRole: user.role,
          subscribedServices: user.subscribedServices || [],
          instituteId: user.role === 'superadmin' ? user._id : user?.institute?._id,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();

      setConversation(prev => [...prev, { 
        id: `resp-${Date.now()}`,
        type: 'ai', 
        content: data.answer, 
        report: data.report, 
        chart: data.chart 
      }]);
    } catch (error) {
      console.error('Error fetching answer:', error);
      setConversation(prev => [...prev, { type: 'ai', content: 'An error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = async (messageId, type) => {
    const element = type === 'chart' ? chartRefs.current[messageId] : tableRefs.current[messageId];
    if (!element) return;

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
    pdf.save(`${type === 'chart' ? 'chart' : 'table'}-export.pdf`);
  };

  const copyToClipboard = async (messageId, type) => {
    try {
      if (type === 'chart') {
        const canvas = await html2canvas(chartRefs.current[messageId]);
        canvas.toBlob(blob => {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
            // Show temporary success message
            const tempDiv = document.createElement('div');
            tempDiv.textContent = 'Chart copied to clipboard!';
            tempDiv.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-md z-50';
            document.body.appendChild(tempDiv);
            setTimeout(() => document.body.removeChild(tempDiv), 2000);
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
        
        // Show temporary success message
        const tempDiv = document.createElement('div');
        tempDiv.textContent = 'Table copied to clipboard!';
        tempDiv.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-md z-50';
        document.body.appendChild(tempDiv);
        setTimeout(() => document.body.removeChild(tempDiv), 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const renderReport = (report, messageId) => {
    if (!report || !Array.isArray(report) || report.length === 0) return null;

    const headers = Object.keys(report[0]);
    return (
      <div className="mt-4 relative">
        <div className="absolute right-2 top-2 flex gap-2">
          <button 
            onClick={() => copyToClipboard(messageId, 'table')}
            className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            title="Copy to clipboard"
          >
            <FaCopy size={14} />
          </button>
          <button 
            onClick={() => downloadAsPDF(messageId, 'table')}
            className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            title="Download as PDF"
          >
            <FaDownload size={14} />
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
          <table 
            ref={el => tableRefs.current[messageId] = el}
            className="min-w-full bg-white rounded-lg"
          >
            <thead>
              <tr className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
                {headers.map((header, idx) => (
                  <th key={idx} className="py-3 px-4 text-left capitalize font-medium">{header.replace(/([A-Z])/g, ' $1')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white hover:bg-gray-100 transition-colors'}>
                  {headers.map((header, hIdx) => (
                    <td key={hIdx} className="py-3 px-4 border-t border-gray-100">{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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

    if (chart.type === 'bar') {
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

    // Update the chart colors to match new theme
    if (chart.type === 'bar' && chart.datasets) {
      chart.datasets = chart.datasets.map(dataset => ({
        ...dataset,
        backgroundColor: 'rgba(13, 148, 136, 0.7)',
        borderColor: 'rgb(13, 148, 136)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(13, 148, 136, 0.9)'
      }));
    } else if (chart.type === 'pie' && chart.datasets) {
      chart.datasets = chart.datasets.map(dataset => ({
        ...dataset,
        backgroundColor: [
          'rgba(13, 148, 136, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(56, 189, 248, 0.8)',
        ],
        borderColor: 'white',
        borderWidth: 2,
        hoverOffset: 10
      }));
    }

    return (
      <div className="mt-4 relative">
        <div className="absolute right-2 top-2 flex gap-2 z-10">
          <button 
            onClick={() => copyToClipboard(messageId, 'chart')}
            className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            title="Copy to clipboard"
          >
            <FaCopy size={14} />
          </button>
          <button 
            onClick={() => downloadAsPDF(messageId, 'chart')}
            className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            title="Download as PDF"
          >
            <FaDownload size={14} />
          </button>
        </div>
        <div ref={el => chartRefs.current[messageId] = el} className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="h-80">
            {chart.type === 'bar' ? (
              <Bar data={chart} options={options} />
            ) : (
              <Pie data={chart} options={options} />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (userLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <FaSpinner className="animate-spin text-4xl text-teal-600" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 p-4 md:p-6"
    >
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full shadow-md">
                <FaRobot className="h-6 w-6 text-teal-600" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-white">ERP AI Assistant</h1>
            </div>
            {user && (
              <div className="text-sm bg-white/20 px-3 py-1.5 rounded-full text-white backdrop-blur-sm">
                {user.name || user.email} ({user.role})
              </div>
            )}
          </div>
          {user && user.subscribedServices?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {user.subscribedServices.map((service, idx) => (
                <span key={idx} className="text-xs bg-white/30 px-2 py-1 rounded-full text-white backdrop-blur-sm">
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 h-[700px] overflow-y-auto p-4 md:p-6 flex flex-col gap-6" style={{ scrollBehavior: 'smooth' }}>
          {conversation.length === 0 && (
            <div className="text-center p-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mb-6">
                <FaInfoCircle className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">How can I assist you today?</h2>
              <p className="text-gray-600 mb-6">Try these examples to get started:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  'Attendance report for CSE',
                  'List all departments',
                  'Feedback summary for event',
                  'Course details with classes',
                  'How many students in college'
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50"
                    onClick={() => {
                      setQuestion(suggestion);
                      setTimeout(() => handleSubmit(), 100);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {conversation.map((message, idx) => (
            <div key={idx} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl p-4 shadow ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`p-1.5 rounded-full ${message.type === 'user' ? 'bg-teal-500' : 'bg-teal-100'}`}>
                      {message.type === 'user' ? <FaUser className="h-3.5 w-3.5 text-white" /> : <FaRobot className="h-3.5 w-3.5 text-teal-600" />}
                    </div>
                    <span className={`ml-2 font-medium text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-600'}`}>
                      {message.type === 'user' ? 'You' : 'ERP Assistant'}
                    </span>
                  </div>

                  {/* Options menu for AI responses with tables/charts */}
                  {message.type === 'ai' && (message.report || message.chart) && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowOptions(showOptions === message.id ? null : message.id)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <FaEllipsisH className="h-4 w-4 text-gray-500" />
                      </button>
                      
                      {showOptions === message.id && (
                        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-48">
                          <div className="py-1">
                            {message.report && (
                              <>
                                <button 
                                  onClick={() => {
                                    copyToClipboard(message.id, 'table');
                                    setShowOptions(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaCopy className="mr-2" /> Copy table
                                </button>
                                <button 
                                  onClick={() => {
                                    downloadAsPDF(message.id, 'table');
                                    setShowOptions(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaDownload className="mr-2" /> Download table
                                </button>
                              </>
                            )}
                            {message.chart && (
                              <>
                                <button 
                                  onClick={() => {
                                    copyToClipboard(message.id, 'chart');
                                    setShowOptions(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaCopy className="mr-2" /> Copy chart
                                </button>
                                <button 
                                  onClick={() => {
                                    downloadAsPDF(message.id, 'chart');
                                    setShowOptions(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaDownload className="mr-2" /> Download chart
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className={`${message.type === 'user' ? 'text-white' : 'text-gray-700'} leading-relaxed`}>{message.content}</p>
                {message.type === 'ai' && renderReport(message.report, message.id)}
                {message.type === 'ai' && renderChart(message.chart, message.id)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm max-w-[85%]">
                <div className="flex items-center">
                  <div className="p-1.5 rounded-full bg-teal-100">
                    <FaRobot className="h-3.5 w-3.5 text-teal-600" />
                  </div>
                  <span className="ml-2 font-medium text-sm text-gray-600">ERP Assistant</span>
                </div>
                <div className="flex space-x-2 mt-4 pl-3">
                  <div className="h-2.5 w-2.5 bg-teal-400 rounded-full animate-bounce"></div>
                  <div className="h-2.5 w-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2.5 w-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={user ? "Ask about reports, charts, or anything else..." : "Please log in to use the assistant"}
              className="flex-grow p-3.5 rounded-l-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={loading || !user}
            />
            <button
              type="submit"
              className={`px-6 py-3.5 rounded-r-xl font-medium ${
                loading || !user || !question.trim() 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600'
              } transition duration-200`}
              disabled={loading || !user || !question.trim()}
            >
              {loading ? <FaSpinner className="animate-spin" /> : 'Send'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-1">Try: "Generate feedback summary" or "List all departments"</p>
        </form>
      </div>
    </motion.div>
  );
}