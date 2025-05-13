'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardBody, Button } from '@nextui-org/react';
import {
  Users,
  Fingerprint,
  BookOpen,
  FileSpreadsheet,
  MessageSquare,
  BarChart3,
  FileCheck,
  Book,
  Building2,
  Sparkles,
  ArrowRight,
  Award,Clock,
  PhoneIcon
} from 'lucide-react'; 
import AttendanceSystemModule from '@/public/illustrations/home/AttendanceSystemModule';
import StudentManagementModule from '@/public/illustrations/home/StudentManagementModule';
export default function Modules() {
  const modules = [
    {
      title: "Student Management",
      description: "Complete student lifecycle management from admission to alumni with detailed profiles and progress tracking",
      icon: Users,
      gradient: "from-blue-500/20 via-indigo-500/10 to-purple-500/20",
      hover: "hover:bg-gradient-to-br hover:from-blue-500/30 hover:to-purple-500/30",
    },
    {
      title: "Attendance System",
      description: "Advanced attendance tracking with automated reports, biometric integration, and real-time analytics",
      icon: Fingerprint,
      gradient: "from-emerald-500/20 via-green-500/10 to-teal-500/20",
      hover: "hover:bg-gradient-to-br hover:from-emerald-500/30 hover:to-teal-500/30",
    },
    {
      title: "Academic Management",
      description: "Comprehensive course planning, scheduling, curriculum management and academic resource allocation",
      icon: BookOpen,
      gradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
      hover: "hover:bg-gradient-to-br hover:from-orange-500/30 hover:to-yellow-500/30",
    },
    {
      title: "Staff Management",
      description: "Centralized faculty and staff management with performance tracking, resource allocation and communication tools",
      icon: Building2,
    
      gradient: "from-pink-500/20 via-rose-500/10 to-red-500/20",
      hover: "hover:bg-gradient-to-br hover:from-pink-500/30 hover:to-red-500/30",
    },
    {
      title: "Feedback System",
      description: "360° feedback collection tools with sentiment analysis, automated action items, and improvement tracking",
      icon: MessageSquare,
      gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
      hover: "hover:bg-gradient-to-br hover:from-violet-500/30 hover:to-fuchsia-500/30",
    },
    {
      title: "Performance Analytics",
      description: "AI-powered analytics with predictive insights, customizable dashboards, and comprehensive reporting system",
      icon: BarChart3,
      gradient: "from-cyan-500/20 via-sky-500/10 to-blue-500/20",
      hover: "hover:bg-gradient-to-br hover:from-cyan-500/30 hover:to-blue-500/30",
    },
    {
      title: "Outcome-Based Education",
      description: "Tools for defining, tracking and assessing educational outcomes aligned with industry standards",
      icon: FileCheck,
      gradient: "from-lime-500/20 via-green-500/10 to-emerald-500/20",
      hover: "hover:bg-gradient-to-br hover:from-lime-500/30 hover:to-emerald-500/30",
    },
    {
      title: "Course Management",
      description: "Integrated platform for course creation, content delivery, and progress monitoring with multimedia support",
      icon: Book,
      gradient: "from-amber-500/20 via-orange-500/10 to-red-500/20",
      hover: "hover:bg-gradient-to-br hover:from-amber-500/30 hover:to-red-500/30",
    },
    {
      title: "Department Portal",
      description: "Department-specific dashboards for managing faculty, resources, research initiatives and academic programs",
      icon: Building2,
      gradient: "from-purple-500/20 via-indigo-500/10 to-blue-500/20",
      hover: "hover:bg-gradient-to-br hover:from-purple-500/30 hover:to-blue-500/30",
    },
  ];

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const moduleStagger = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-20 md:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={moduleStagger}
        className="text-center max-w-3xl mx-auto space-y-6 mb-20"
      >
        <motion.span
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm"
        >
          <Sparkles className="h-4 w-4" />
          Complete Solution
        </motion.span>

        <motion.h2
          variants={fadeInUp}
          className="text-4xl font-outfit font-bold text-gray-900"
        >
          Comprehensive Module Suite
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="text-xl text-gray-600"
        >
          A complete ecosystem of integrated tools designed to handle every aspect of educational institution management
        </motion.p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {modules.map((module, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <Card
              className={`h-full transition-all duration-500 overflow-hidden ${module.hover}`}
              isPressable
            >
              <CardBody className="p-8 space-y-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-60 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-sm w-fit mb-6">
                    <module.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-outfit font-semibold mb-4">{module.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{module.description}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="container mx-auto px-4 mt-20"
      >
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-outfit font-bold text-gray-900"
          >
            Explore Our Core Modules
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600"
          >
            Dive deeper into the specialized modules that make EduMatrix Pro the complete solution for educational institutions
          </motion.p>
        </div>

        {/* Featured Module - Student Management */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="grid md:grid-cols-2 gap-16 items-center mb-20"
        >
          <div className="order-2 md:order-1">
            <h3 className="text-3xl font-outfit font-bold text-gray-900 mb-6">
              Student Management System
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Manage the complete student lifecycle from admission to alumni with our comprehensive student management module.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {[
                {
                  title: "Digital Admissions",
                  description: "Paperless admission process with application tracking",
                  icon: FileCheck,
                },
                {
                  title: "360° Student Profile",
                  description: "Complete academic and personal records in one place",
                  icon: Users,
                },
                {
                  title: "Performance Analytics",
                  description: "Track progress with visual dashboards and insights",
                  icon: BarChart3,
                },
                {
                  title: "Communication Hub",
                  description: "Keep students and parents updated automatically",
                  icon: MessageSquare,
                },
              ].map((feature, idx) => (
                <Card key={idx} className="bg-white/80 border-none shadow-sm">
                  <CardBody className="p-5">
                    <feature.icon className="h-6 w-6 text-primary mb-3" />
                    <h4 className="font-outfit font-semibold text-base mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            <Button
              as={Link}
              href="/modules/student-management"
              endContent={<ArrowRight className="h-4 w-4" />}
              className="bg-primary text-white font-medium"
            >
              Learn More
            </Button>
          </div>

          <div className="order-1 md:order-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-500/10 rounded-3xl transform rotate-3"></div>
                <svg
                  className="relative rounded-2xl shadow-lg w-full h-auto"
                  viewBox="0 0 600 500"
                  aria-label="Student Management Module"
                >
                  <StudentManagementModule />
                </svg>
              </div>
        </motion.div>

        {/* Featured Module - Attendance System */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="grid md:grid-cols-2 gap-16 items-center mb-20"
        >
             <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-3xl transform -rotate-3"></div>
                <svg
                  className="relative rounded-2xl shadow-lg w-full h-auto"
                  viewBox="0 0 600 500"
                  aria-label="Attendance System Module"
                >
                  <AttendanceSystemModule />
                </svg>
              </div>

          <div>
            <h3 className="text-3xl font-outfit font-bold text-gray-900 mb-6">
              Smart Attendance Management
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Revolutionize attendance tracking with our multi-modal system that combines biometric, mobile, and AI technologies.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {[
                {
                  title: "Mobile App Interface",
                  description: "Mobile app options for android and iOS for easy access",
                  icon: PhoneIcon,
                },
                {
                  title: "Real-time Reports",
                  description: "Instant insights for better decision making",
                  icon: Clock,
                },
                {
                  title: "Auto Notifications",
                  description: "Alerts for students, parents and mentors",
                  icon: MessageSquare,
                },
                {
                  title: "Trend Analysis",
                  description: "AI-powered attendance pattern recognition",
                  icon: BarChart3,
                },
              ].map((feature, idx) => (
                <Card key={idx} className="bg-white/80 border-none shadow-sm">
                  <CardBody className="p-5">
                    <feature.icon className="h-6 w-6 text-emerald-600 mb-3" />
                    <h4 className="font-outfit font-semibold text-base mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            <Button
              as={Link}
              href="/modules/attendance-management"
              endContent={<ArrowRight className="h-4 w-4" />}
              className="bg-emerald-600 text-white font-medium"
            >
              Explore Features
            </Button>
          </div>
        </motion.div>

        {/* All Modules Grid */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-outfit font-semibold text-gray-900 mb-10">
            Other Essential Modules
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Academic Management",
                description: "Course planning, scheduling, faculty allocation, and academic calendar management",
                icon: BookOpen,
                color: "text-orange-600",
                bgColor: "bg-orange-100",
              },
              {
                title: "Attendance System",
                description: "Advanced attendance tracking with biometric integration and real-time analytics",
                icon: Fingerprint,
                
                color: "text-pink-600",
                bgColor: "bg-pink-100",
              },
              {
                title: "Outcome-Based Education",
                description: "Define, track and assess educational outcomes aligned with industry standards",
                icon: Award,
                color: "text-violet-600",
                bgColor: "bg-violet-100",
              },
            ].map((module, idx) => (
              <motion.div
                key={idx}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <CardBody className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full ${module.bgColor} mx-auto mb-6 flex items-center justify-center`}>
                      <module.icon className={`h-8 w-8 ${module.color}`} />
                    </div>
                    <h4 className="text-xl font-outfit font-semibold mb-3">{module.title}</h4>
                    <p className="text-gray-600 mb-6">{module.description}</p>
                    <Button
                      as={Link}
                      href={`/modules/${module.title.toLowerCase().replace(/\s+/g, '-')}`}
                      variant="light"
                      className={module.color}
                      endContent={<ArrowRight className="h-4 w-4" />}
                    >
                      Learn More
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}