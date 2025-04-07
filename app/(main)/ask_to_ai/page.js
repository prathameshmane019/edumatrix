// app\(main)\ask_to_ai\page.js
"use client"
import { useState, useRef, useEffect } from 'react';
import { GiChatBubble } from 'react-icons/gi';
import { FaSpinner, FaRobot, FaUser, FaInfoCircle } from 'react-icons/fa';
import { useUser } from '@/app/context/UserContext';
import { motion } from 'framer-motion';

export default function AskToAI() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [clarificationNeeded, setClarificationNeeded] = useState(false);
  const [clarificationOptions, setClarificationOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const { user, loading: userLoading } = useUser();
  const messageEndRef = useRef(null);

  // Scroll to bottom of conversation when new messages are added
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!user || userLoading || !question.trim()) return;

    // Add user message to conversation
    const userMessage = question;
    setConversation(prev => [...prev, { type: 'user', content: userMessage }]);
    
    setLoading(true);
    setQuestion('');
    setClarificationNeeded(false);
    setClarificationOptions([]);

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
      console.log('Response data:', data);
      
      // Check if clarification is needed
      if (data.needsMoreInfo) {
        setClarificationNeeded(true);
        if (data.options && data.options.length > 0) {
          setClarificationOptions(data.options);
        }
      }
      
      // Add AI response to conversation
      setConversation(prev => [...prev, { 
        type: 'ai', 
        content: data.answer,
        needsMoreInfo: data.needsMoreInfo,
        data: data.data,
        options: data.options
      }]);
    } catch (error) {
      console.error('Error fetching answer:', error);
      setConversation(prev => [...prev, { 
        type: 'ai', 
        content: 'An error occurred while processing your request. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option.name);
    setQuestion(`I want to see information for ${option.name}`);
    setTimeout(() => {
      handleSubmit();
    }, 100);
  };

  // Function to render different types of data
  const renderData = (message) => {
    if (!message.data) return null;
    
    // Handle attendance data
    if (Array.isArray(message.data.records)) {
      return (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Student</th>
                <th className="py-2 px-4 border-b text-left">Roll Number</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {message.data.records.map((record, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 border-b">{record.student?.personalDetails?.name || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{record.student?.academicDetails?.rollNumber || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    // Handle class list
    if (Array.isArray(message.data) && message.data[0]?.department) {
      return (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {message.data.map((classItem, idx) => (
            <div 
              key={idx} 
              className="border border-blue-200 bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => handleOptionSelect(classItem)}
            >
              <p className="font-medium">{classItem.year} {classItem.department}</p>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  // Render options for clarification
  const renderOptions = (message) => {
    if (!message.options || !Array.isArray(message.options) || message.options.length === 0) return null;
    
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Please select an option:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {message.options.map((option, idx) => (
            <button 
              key={idx}
              onClick={() => handleOptionSelect(option)}
              className="border border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-lg p-2 text-left text-blue-700 transition-colors"
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (userLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <FaSpinner className="animate-spin text-4xl text-blue-600" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full shadow-md">
                <FaRobot className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-white">ERP AI Assistant</h1>
            </div>
            {user && (
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full text-white">
                {user.name || user.email} ({user.role})
              </div>
            )}
          </div>
          
          {user && user.subscribedServices?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {user.subscribedServices.map((service, idx) => (
                <span key={idx} className="text-xs bg-white/30 px-2 py-1 rounded-full text-white">
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Chat area */}
        <div className="bg-gray-50 h-[500px] overflow-y-auto p-6 flex flex-col gap-4">
          {/* Welcome message */}
          {conversation.length === 0 && (
            <div className="text-center p-8">
              <FaInfoCircle className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">How can I help you today?</h2>
              <p className="text-gray-600 mb-4">You can ask me about:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {['Attendance records', 'Student information', 'Faculty details', 'Subject information', 'Department data'].map((suggestion, idx) => (
                  <button 
                    key={idx}
                    className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 text-gray-700"
                    onClick={() => {
                      setQuestion(`Tell me about ${suggestion.toLowerCase()}`);
                      setTimeout(() => {
                        handleSubmit();
                      }, 100);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Conversation messages */}
          {conversation.map((message, idx) => (
            <div key={idx} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
              }`}>
                <div className="flex items-center mb-2">
                  <div className={`p-1 rounded-full ${message.type === 'user' ? 'bg-blue-500' : 'bg-blue-100'}`}>
                    {message.type === 'user' ? (
                      <FaUser className="h-4 w-4 text-white" />
                    ) : (
                      <FaRobot className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <span className={`ml-2 font-medium text-sm ${message.type === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                    {message.type === 'user' ? 'You' : 'ERP Assistant'}
                  </span>
                </div>
                <p className={message.type === 'user' ? 'text-white' : 'text-gray-700'}>
                  {message.content}
                </p>
                
                {/* Render data tables if available */}
                {message.type === 'ai' && renderData(message)}
                
                {/* Render options for clarification */}
                {message.type === 'ai' && message.needsMoreInfo && renderOptions(message)}
              </div>
            </div>
          ))}
          
          {/* Loading animation */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm max-w-[80%]">
                <div className="flex items-center">
                  <div className="p-1 rounded-full bg-blue-100">
                    <FaRobot className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="ml-2 font-medium text-sm text-gray-600">
                    ERP Assistant
                  </span>
                </div>
                <div className="flex space-x-2 mt-3 pl-2">
                  <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-3 w-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messageEndRef} />
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={user ? "Ask any question about your college ERP..." : "Please log in to use the assistant"}
              className="flex-grow p-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || !user}
            />
            <button
              type="submit"
              className={`px-6 py-3 rounded-r-lg font-medium ${
                loading || !user || !question.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition duration-200`}
              disabled={loading || !user || !question.trim()}
            >
              {loading ? <FaSpinner className="animate-spin" /> : 'Send'}
            </button>
          </div>
          
          {/* Help text */}
          <p className="text-xs text-gray-500 mt-2">
            Try asking "Show me attendance for Computer Science class" or "How many students are in Electronics department?"
          </p>
        </form>
      </div>
    </motion.div>
  );
}