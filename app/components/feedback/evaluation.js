"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, SelectItem } from "@nextui-org/react";
import { Button } from '@nextui-org/react';
import { useUser } from '@/app/context/UserContext';
import dynamic from 'next/dynamic';
import { Tabs, Tab } from "@nextui-org/react";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import Image from 'next/image';

const EvaluationPage = ({ role }) => {
  const [cumulativeStudentCategories, setCumulativeStudentCategories] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responses, setResponses] = useState([]);
  const [feedbackMode, setFeedbackMode] = useState('cumulative');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [evaluationDetails, setEvaluationDetails] = useState({
    department: "",
    institute: "",
  });

  const { user } = useUser();

  // Set department and institute based on user role
  useEffect(() => {
    if (user?.role === "superadmin") {
      setEvaluationDetails((prev) => ({
        ...prev,
        institute: user?._id,
      }));
    } else if (user?.role === "admin") {
      setEvaluationDetails((prev) => ({
        ...prev,
        department: user?.id,
        institute: user?.institute,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (evaluationDetails.department) {
      fetchFeedbackData(evaluationDetails.department);
    }
  }, [evaluationDetails]);

  const fetchFeedbackData = async (department) => {
    try {
      const response = await axios.get(`/api/EvalFeedback?department=${department}`);
      const filteredFeedbackData = response.data.filter(
        feedback => !feedback.isActive
      );
      setFeedbackData(filteredFeedbackData);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    }
  };

  useEffect(() => {
    if (selectedFeedback) {
      fetchFeedbackResponses(selectedFeedback._id);
    }
  }, [selectedFeedback]);

  const fetchFeedbackResponses = async (feedbackId) => {
    try {
      const response = await axios.get(`/api/response?feedbackId=${feedbackId}`);
      setResponses(response.data);
      console.log(response);
    } catch (error) {
      console.error('Error fetching responses:', error);
      setResponses([]);
    }
  };

  const printDiv = () => {
    window.print();
  };

  useEffect(() => {
    if (selectedFeedback && responses.length > 0) {
      const categories = calculateCumulativeStudentCategories();
      setCumulativeStudentCategories(categories);
    }
  }, [selectedFeedback, responses]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Render functions and other logic remain unchanged...
  
  const renderEventFeedback = () => {
    return (
      <div id="table-to-print" className="bg-white rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-2 text-center">SKN Sinhgad College of Engineering, Pandharpur</h2>
        <h2 className="text-xl font-bold mb-2 text-center">Event Feedback</h2>
        <h2 className="text-lg font-bold mb-2 text-center">
          Event: {selectedFeedback?.feedbackTitle}
        </h2>
        <p className="mb-2">
          Date of Feedback: {formatDate(responses[0]?.date)} Total Feedbacks: {responses.length}
        </p>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="px-1 py-1">Question</th>
              <th className="px-1 py-1">Average Rating</th>
              <th className="px-1 py-1">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {selectedFeedback &&
              selectedFeedback.questions.map((question, index) => {
                const avgRating = calculateEventQuestionRating(index);
                return (
                  <tr key={index}>
                    <td className="border px-2 py-2 text-start min-w-[35vw]">{question}</td>
                    <td className="border text-center px-1 py-1">{avgRating.toFixed(2)}</td>
                    <td className="border text-center px-1 py-1">
                      {calculatePercentage(avgRating).toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Suggestions:</h3>
          <ul className="list-disc list-inside text-left">
            {getEventSuggestions().map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderAnalysisForEvent = () => {
    const averageRatings = selectedFeedback.questions.map((_, index) => calculateEventQuestionRating(index));

    return (
      <div className='flex flex-col justify-center items-center mx-auto'>
        <h3 className="text-lg text-center font-semibold mt-4">Average Ratings Per Question</h3>
        <Chart
          options={{
            chart: {
              type: 'bar',
              height: 350,
              toolbar: {
                show: true,
                tools: {
                  download: true,
                },
              },
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded',
              },
            },
            dataLabels: {
              enabled: false,
            },
            xaxis: {
              categories: selectedFeedback.questions.map((q, index) => `Q${index + 1}`),
            },
            yaxis: {
              title: {
                text: 'Average Rating',
              },
              max: 5,
            },
            fill: {
              opacity: 1,
            },
            tooltip: {
              y: {
                formatter: function (val) {
                  return val.toFixed(2);
                },
              },
            },
          }}
          series={[
            {
              name: 'Average Rating',
              data: averageRatings,
            },
          ]}
          type="bar"
          height={400}
          width={600}
        />
      </div>
    );
  };

  return (
    <div className='w-full mx-auto'>
      <h2 className='text-2xl w-full text-center mt-8 font-bold'>Faculty Evaluation</h2>
      <div className="container w-full mx-auto px-4 py-8">
        {selectedFeedback &&
          <div className='w-full items-end flex justify-end my-2'>
            <Button variant="bordered" onClick={printDiv}>Print</Button>
          </div>}
        <div className="flex gap-10 mb-4 ">
          {role && (
            <div>
              <Select
                label="Select a Department"
                placeholder="Select a Department"
                defaultSelectedKeys={[selectedDepartment]}
                onChange={(e) => fetchFeedbackData(e.target.value)}
              >
                <SelectItem key="Central" value="Central">CENTRAL</SelectItem>
                <SelectItem key="CSE" value="CSE">CSE</SelectItem>
                <SelectItem key="ENTC" value="ENTC">ENTC</SelectItem>
                <SelectItem key="ELEC" value="ELEC">ELECTRICAL</SelectItem>
                <SelectItem key="MECH" value="MECH">MECHANICAL</SelectItem>
                <SelectItem key="Civil" value="Civil">CIVIL</SelectItem>
              </Select>
            </div>
          )}
          <div>
            <Select
              label="Select feedback"
              placeholder="Select feedback"
              onChange={(e) => setSelectedFeedback(feedbackData?.find(feedback => feedback._id === e.target.value))}
            >
              {feedbackData &&
                feedbackData.map((feedback) => (
                  <SelectItem key={feedback._id} value={feedback._id}>
                    {feedback.feedbackTitle}
                  </SelectItem>
                ))}
            </Select>
          </div>
          {selectedFeedback?.feedbackType === "academic" && (
            <div>
              <Select
                label="Select Feedback Mode"
                placeholder="Select Feedback Mode"
                defaultSelectedKeys={[feedbackMode]}
                onChange={(e) => {
                  setFeedbackMode(e.target.value);
                  setSelectedSubject(null);
                }}
              >
                <SelectItem key="individual" value="individual">Individual Feedback</SelectItem>
                <SelectItem key="cumulative" value="cumulative">Cumulative Feedback</SelectItem>
              </Select>
            </div>
          )}
          {selectedFeedback?.feedbackType === "academic" && feedbackMode === 'individual' && (
            <div>
              <Select
                label="Select a Subject"
                placeholder="Select a Subject"
                onChange={(e) => setSelectedSubject(selectedFeedback?.subjects?.find(subject => subject._id === e.target.value))}
              >
                {selectedFeedback && selectedFeedback.subjects.map((subject) => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.subject}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
        </div>

        {selectedFeedback ? (
          <Tabs aria-label="Evaluation Tabs">
            <Tab key="evaluation" title="Evaluation">
              {selectedFeedback.feedbackType === "event" ? renderEventFeedback() : (
                <>
                  {feedbackMode === 'individual' && selectedSubject && (
                    <div id="table-to-print" className="bg-white rounded-lg p-6 mx-auto w-full">
                      <h2 className="text-2xl font-bold mb-4 text-center mx-auto w-full ">SKN Sinhgad College of Engineering, Pandharpur</h2>
                      <h2 className="text-xl font-bold mb-4 text-center">Feedback Report</h2>
                      <h2 className="text-xl font-bold mb-2 text-center">
                        Subject: {selectedSubject.subject}
                      </h2>
                      <p className="mb-4">Date of Feedback: {formatDate(responses[0]?.date)} Total Feedbacks: {responses.length}</p>
                      <p className="mb-4">Faculty : {selectedSubject.faculty}</p>
                      <table className="w-full table-auto mx-auto">
                        {/* ... (table content remains the same) ... */}
                      </table>
                      <div className="mt-4">
                        <h3 className="text-lg font-bold">Suggestions for {selectedSubject.faculty}:</h3>
                        <ul className="list-disc list-inside">
                          {getSuggestionsForSubject(selectedSubject._id).map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {(selectedFeedback?.feedbackType === "event" || feedbackMode === 'cumulative') && (
                    <div id="table-to-print" className="bg-white rounded-lg p-6 text-center">
                      <h2 className="text-xl font-bold mb-2 text-center">SKN Sinhgad College of Engineering, Pandharpur</h2>
                      <h2 className="text-xl font-bold mb-2 text-center">Cumulative Feedback</h2>
                      <h2 className="text-lg font-bold mb-2 text-center">
                        Feedback Title: {selectedFeedback?.feedbackTitle}
                      </h2>
                      <p className="mb-2">Date of Feedback: {formatDate(responses[0]?.date)} Total Feedbacks: {responses.length}</p>
                      <table className="w-full table-auto">
                        {/* ... (table content remains the same) ... */}
                      </table>
                      <div className="mt-4">
                        <h3 className="text-xl font-bold mb-2">Suggestions:</h3>
                        <table className="w-full table-auto">
                          {/* ... (table content remains the same) ... */}
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Tab>
            <Tab key="analysis" title="Analysis">
              <div id="table-to-print" className="flex flex-col justify-center items-center w-full">
                {selectedFeedback.feedbackType === "event" ? renderAnalysisForEvent() : (
                  <>
                    {selectedFeedback && selectedSubject && (
                      <div className='flex flex-col justify-center items-center mx-auto'>
                        <h3 className="text-lg text-center font-semibold mt-4">Evaluation Points Per Question</h3>
                        <Chart
                          options={{
                            chart: {
                              type: 'bar',
                              height: 350,
                              toolbar: {
                                show: true,
                                tools: {
                                  download: true,
                                },
                              },
                            },
                            plotOptions: {
                              bar: {
                                horizontal: false,
                                columnWidth: '55%',
                                endingShape: 'rounded',
                              },
                            },
                            dataLabels: {
                              enabled: false,
                            },
                            xaxis: {
                              categories: selectedFeedback.questions.map((q, index) => `Q${index + 1}`),
                            },
                            yaxis: {
                              title: {
                                text: 'Points',
                              },
                            },
                            fill: {
                              opacity: 1,
                            },
                            tooltip: {
                              y: {
                                formatter: function (val) {
                                  return val;
                                },
                              },
                            },
                          }}
                          series={[
                            {
                              name: 'Points',
                              data: selectedFeedback.questions.map((_, index) => calculateEvaluationPoint(index).toFixed(2)),
                            },
                          ]}
                          type="bar"
                          height={400}width={400}
                        />

                        <h3 className="text-lg font-semibold mt-4">Student Categories</h3>
                        <Chart
                          options={{
                            labels: ['No Problem', 'Problem'],
                            legend: {
                              position: 'bottom',
                            },
                            chart: {
                              toolbar: {
                                show: true,
                                tools: {
                                  download: true,
                                },
                              },
                            },
                            plotOptions: {
                              pie: {
                                donut: {
                                  size: '45%',
                                },
                              },
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function (val, opts) {
                                return opts.w.globals.labels[opts.seriesIndex] + ': ' + val.toFixed(2) + '%';
                              },
                            },
                          }}
                          series={[noProblemPercentage, problemPercentage]}
                          type="donut"
                          height={400}
                          width={400}
                        />
                      </div>
                    )}

                    {feedbackMode === 'cumulative' && (
                      <div className='flex flex-col justify-center items-center mx-auto'>
                        <h3 className="text-center text-lg font-semibold mt-4">Cumulative Student Categories</h3>
                        <Chart
                          options={{
                            chart: {
                              type: 'bar',
                              toolbar: {
                                show: true,
                                tools: {
                                  download: true,
                                },
                              },
                            },
                            plotOptions: {
                              bar: {
                                horizontal: false,
                                dataLabels: {
                                  position: 'top',
                                },
                              },
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function (val, opts) {
                                return val.toFixed(2) + '%';
                              },
                            },
                            xaxis: {
                              categories: selectedFeedback.subjects.map(subject => subject.faculty),
                            },
                            yaxis: {
                              min: 0,
                              max: 100,
                              labels: {
                                formatter: function (value) {
                                  return value.toFixed(2) + '%';
                                }
                              }
                            },
                            tooltip: {
                              y: {
                                formatter: function (value) {
                                  return value.toFixed(2) + '%';
                                }
                              }
                            },
                            legend: {
                              position: 'bottom',
                            },
                          }}
                          series={[{
                            name: 'No Problem Percentage',
                            data: selectedFeedback.subjects.map(subject =>
                              cumulativeStudentCategories[subject._id]?.noProblemPercentage || 0
                            )
                          }]}
                          type='bar'
                          height={400}
                          width={600}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </Tab>
          </Tabs>
        ) : (
          <div className='w-full flex justify-center items-center'>
            <Image
              src="/feedback.svg"
              width={600}
              height={600}
              alt="Picture of the author"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationPage;

