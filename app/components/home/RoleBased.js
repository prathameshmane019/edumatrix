'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Tabs, Tab, Button } from '@nextui-org/react';
import { ArrowRight, GraduationCap, ClapperboardIcon as ChalkboardTeacher, Building2, Layers, Check } from 'lucide-react';
import {
  StudentDashboard,
  FacultyPortal,
  InstituteManagement,
  DepartmentDashboard} from '@/public/home/home'

export default function RoleBased() {
  const [activeTab, setActiveTab] = useState("students");

  const roleContent = {
    students: {
      title: "Student Portal",
      description: "Empower students with easy access to course materials, attendance records, grades, and communication tools.",
      features: [
        "Personalized dashboards showing course progress",
        "Real-time attendance tracking and notifications",
        "Grade visualization with improvement insights",
        "Online assignment submission and feedback",
      ],
      illustration: StudentDashboard,
    },
    faculty: {
      title: "Faculty Management",
      description: "Comprehensive tools for educators to manage courses, track student performance, and streamline administrative tasks.",
      features: [
        "Intuitive course management interface",
        "Smart attendance tracking with biometrics",
        "Performance analytics for student evaluation",
        "Digital content creation and distribution",
      ],
      illustration: FacultyPortal,
    },
    institute: {
      title: "Institute Administration",
      description: "Powerful administration tools to oversee all aspects of institution management from a centralized dashboard.",
      features: [
        "Complete institutional analytics and reporting",
        "Resource allocation and optimization",
        "Policy management and compliance tracking",
        "Strategic planning with data-driven insights",
      ],
      illustration: InstituteManagement,
    },
    department: {
      title: "Department Operations",
      description: "Specialized departmental tools for academic planning, resource management, and performance tracking.",
      features: [
        "Department-specific analytics and KPIs",
        "Faculty workload management and scheduling",
        "Curriculum development and tracking",
        "Research and publication management",
      ],
      illustration: DepartmentDashboard,
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <section className="py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="text-center max-w-3xl mx-auto space-y-4 mb-16"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-4xl font-outfit font-bold text-gray-900"
        >
          Tailored Solutions for Every Role
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-xl text-gray-600"
        >
          Specialized interfaces and tools designed for different stakeholders in the educational ecosystem
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <Tabs
          variant="underlined"
          color="primary"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary",
          }}
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          className="w-full"
        >
          <Tab
            key="students"
            title={
              <div className="flex items-center gap-2">
                <GraduationCap />
                <span>Students</span>
              </div>
            }
          />
          <Tab
            key="faculty"
            title={
              <div className="flex items-center gap-2">
                <ChalkboardTeacher />
                <span>Faculty</span>
              </div>
            }
          />
          <Tab
            key="institute"
            title={
              <div className="flex items-center gap-2">
                <Building2 />
                <span>Institute</span>
              </div>
            }
          />
          <Tab
            key="department"
            title={
              <div className="flex items-center gap-2">
                <Layers />
                <span>Department</span>
              </div>
            }
          />
        </Tabs>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <h3 className="text-3xl font-outfit font-bold text-gray-900">
                  {roleContent[activeTab].title}
                </h3>
                <p className="text-lg text-gray-600">
                  {roleContent[activeTab].description}
                </p>

                <div className="space-y-4 mt-6">
                  {roleContent[activeTab].features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1 mt-1">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-6 bg-gradient-to-r from-primary to-indigo-600 text-white font-medium"
                  endContent={<ArrowRight className="h-4 w-4" />}
                >
                  Learn More
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-3xl transform rotate-2"></div>
                <svg
                  className="relative rounded-2xl shadow-lg z-10 w-full h-auto"
                  viewBox="0 0 600 400"
                  aria-label={roleContent[activeTab].title}
                >
                  <use href={`#${roleContent[activeTab].illustration}`} />
                </svg>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}