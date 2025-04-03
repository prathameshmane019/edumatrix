import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Feedback from "@/models/feedback";
import Response from "@/models/response";
import Questions from "@/models/questions";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get("instituteId");
    const department = searchParams.get("department");
    const feedbackType = searchParams.get("feedbackType");

    if (!instituteId) {
      return NextResponse.json({ error: "Institute ID is required" }, { status: 400 });
    }

    const filter = { institute: new mongoose.Types.ObjectId(instituteId) };
    if (department && department !== "all") {
      filter.department = department;
    }
    if (feedbackType && feedbackType !== "all") {
      filter.feedbackType = feedbackType;
    }

    const dashboardData = await getFeedbackDashboardMetrics(filter);

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Error fetching feedback dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch feedback dashboard data" }, { status: 500 });
  }
}

async function getFeedbackDashboardMetrics(filter) {
  // Fetch feedback data
  const feedbacks = await Feedback.find(filter)
    .select("feedbackTitle feedbackType department subjects responses students isActive createdAt")
    .lean();

  // Fetch response data
  const responseIds = feedbacks.flatMap((fb) => fb.responses || []);
  const responses = await Response.find({ _id: { $in: responseIds } })
    .select("feedback_id ratings date")
    .lean();

  // Fetch questions data
  const questions = await Questions.find(filter)
    .select("feedbackType subType questions")
    .lean();

  // Calculate key metrics
  const totalFeedbacks = feedbacks.length;
  const activeFeedbacks = feedbacks.filter((fb) => fb.isActive).length;
  const totalResponses = responses.length;
  const totalStudents = feedbacks.reduce((sum, fb) => sum + (fb.students || 0), 0);

  // Feedback type distribution
  const feedbackTypeDist = feedbacks.reduce((acc, fb) => {
    acc[fb.feedbackType] = (acc[fb.feedbackType] || 0) + 1;
    return acc;
  }, {});
  const feedbackTypeDistribution = Object.entries(feedbackTypeDist).map(([type, count]) => ({
    type,
    count,
  }));

  // Department distribution (if no specific department filter)
  let departmentDistribution = [];
  if (!filter.department) {
    const deptCounts = feedbacks.reduce((acc, fb) => {
      const dept = fb.department || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    departmentDistribution = Object.entries(deptCounts).map(([dept, count]) => ({
      department: dept,
      count,
    }));
  }

  // Average ratings per feedback
  // Use feedbackTitle instead of feedback_id
  const ratingsByFeedback = responses.reduce((acc, res) => {
    const feedback = feedbacks.find((fb) => fb._id.toString() === res.feedback_id);
    const feedbackTitle = feedback ? feedback.feedbackTitle : "Unknown Feedback";
    const avgRating =
      res.ratings.reduce((sum, r) => sum + (r.ratings.reduce((a, b) => a + b, 0) / r.ratings.length || 0), 0) /
      (res.ratings.length || 1);
    acc[feedbackTitle] = acc[feedbackTitle] || [];
    acc[feedbackTitle].push(avgRating);
    return acc;
  }, {});
  const avgRatings = Object.entries(ratingsByFeedback).map(([feedbackTitle, ratings]) => ({
    feedbackTitle,
    avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length || 0,
  }));

  const responseRate = totalStudents > 0 ? Math.round((totalResponses / totalStudents) * 100) : 0;

  const questionsByType = questions.reduce((acc, q) => {
    acc[q.feedbackType] = (acc[q.feedbackType] || 0) + q.questions.length;
    return acc;
  }, {});
  const questionsDistribution = Object.entries(questionsByType).map(([type, count]) => ({
    type,
    count,
  }));

  return {
    totalFeedbacks,
    activeFeedbacks,
    totalResponses,
    totalStudents,
    responseRate,
    feedbackTypeDistribution,
    departmentDistribution,
    avgRatings,
    questionsDistribution,
  };
}