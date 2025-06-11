'use client'
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Button, Card, CardBody, CardHeader, Chip, Divider, Tooltip,
    Avatar, Progress, Badge, Tabs, Tab, Accordion, AccordionItem,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure, Input, Textarea, Select, SelectItem
} from '@nextui-org/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/app/components/home/Footer';

// Enhanced modules with more detailed content
const modules = [
    {
        id: 'authentication-rbac',
        title: 'Authentication & Role-Based Access Control (RBAC)',
        category: 'Security',
        description: 'Enterprise-grade secure login system with JWT-based session management for Admin, Faculty, HOD, Principal, and Students. Multi-factor authentication, role-based dashboards, and fine-grained access control ensure maximum data security and streamlined operations in college ERP systems.',
        fullDescription: 'Our advanced authentication system provides military-grade security for educational institutions. Features include biometric login options, SSO integration, password policy enforcement, session management, audit trails, and compliance with educational data protection regulations like FERPA and COPPA.',
        keywords: 'college ERP authentication, RBAC system, secure login for colleges, JWT session management, academic ERP security, multi-factor authentication, SSO integration, FERPA compliance',
        icon: '🔒',
        features: ['Multi-Factor Authentication', 'Single Sign-On (SSO)', 'Biometric Integration', 'Session Management', 'Audit Trail Logging', 'FERPA Compliance'],
        techStack: ['JWT', 'OAuth 2.0', 'LDAP', 'Active Directory'],
        benefits: ['99.9% Security Score', 'Zero Data Breaches', 'Instant Login Experience', 'Complete Audit Compliance']
    },
    {
        id: 'attendance-management',
        title: 'Smart Attendance Management System',
        category: 'Productivity',
        description: 'AI-powered attendance tracking with facial recognition, RFID integration, and QR code scanning. Faculty can mark daily attendance by subject and batch, with auto-generated monthly reports, real-time dashboards for HOD/Principal, and intelligent SMS/email alerts for absenteeism management in college ERP systems.',
        fullDescription: 'Revolutionary attendance management combining multiple technologies for accurate tracking. Features include facial recognition attendance, RFID card integration, mobile app check-in, geofencing for location-based attendance, automated report generation, parent notifications, and integration with academic calendar and timetable systems.',
        keywords: 'college attendance system, facial recognition attendance, RFID attendance tracking, automated attendance reports, absenteeism alerts, ERP attendance management, smart attendance college',
        icon: '📊',
        features: ['Facial Recognition', 'RFID Integration', 'QR Code Scanning', 'Geofencing', 'Mobile Check-in', 'Parent Notifications'],
        techStack: ['OpenCV', 'TensorFlow', 'RFID SDK', 'GPS Integration'],
        benefits: ['95% Accuracy Rate', '80% Time Savings', 'Real-time Tracking', 'Automated Compliance']
    },
    {
        id: 'obe-mapping',
        title: 'Advanced Outcome-Based Education (OBE) Mapping',
        category: 'Academics',
        description: 'Comprehensive OBE framework with intelligent CO-PO/PSO mapping using drag-and-drop interface. Advanced analytics for curriculum alignment, automated compliance reporting, and dynamic mapping adjustments based on industry standards for NAAC/NBA compliance in outcome-based education ERP systems.',
        fullDescription: 'Next-generation OBE mapping system with AI-driven curriculum analysis, automatic course outcome generation, industry alignment checking, competency gap analysis, and intelligent recommendations for curriculum improvement. Supports multiple accreditation frameworks and provides detailed analytics for continuous improvement.',
        keywords: 'OBE mapping, CO-PO mapping tool, outcome-based education ERP, NAAC compliance, NBA accreditation, curriculum alignment, competency mapping, academic analytics',
        icon: '📈',
        features: ['AI-Driven Mapping', 'Industry Alignment', 'Competency Analysis', 'Dynamic Adjustments', 'Multi-Framework Support', 'Automated Reporting'],
        techStack: ['Machine Learning', 'Natural Language Processing', 'Data Analytics', 'Visualization APIs'],
        benefits: ['100% NAAC Compliance', '90% Mapping Accuracy', 'Instant Report Generation', 'Industry-Standard Alignment']
    },
    {
        id: 'co-po-assessment',
        title: 'Comprehensive CO & PO Assessment Module',
        category: 'Academics',
        description: 'Advanced assessment engine for Course Outcomes and Program Outcomes with machine learning-powered analysis. Enter CO attainment levels, visualize attainment vs. target graphs with interactive dashboards, receive AI-driven curriculum improvement suggestions, and export detailed reports in PDF or Excel for NAAC/NBA accreditation.',
        fullDescription: 'Sophisticated assessment module combining statistical analysis with machine learning to provide deep insights into learning outcomes. Features predictive analytics, trend analysis, comparative studies, automated improvement recommendations, and comprehensive reporting with visual analytics for stakeholder presentations.',
        keywords: 'CO attainment, PO assessment, curriculum improvement ERP, NAAC report generation, NBA accreditation, learning analytics, assessment automation, academic evaluation',
        icon: '🎯',
        features: ['ML-Powered Analysis', 'Predictive Analytics', 'Trend Analysis', 'Automated Recommendations', 'Visual Dashboards', 'Comparative Studies'],
        techStack: ['Python Analytics', 'D3.js Visualization', 'Statistical Models', 'Predictive Algorithms'],
        benefits: ['Predictive Insights', 'Automated Analysis', 'Visual Reports', 'Continuous Improvement']
    },
    {
        id: 'student-feedback',
        title: 'Intelligent Student Feedback System',
        category: 'Engagement',
        description: 'AI-powered feedback collection and analysis system with sentiment analysis, anonymous submissions, multi-channel feedback collection, and real-time analytics. Collect comprehensive semester-wise student feedback on teaching effectiveness, content quality, delivery methods, and infrastructure with actionable insights for faculty and administrators.',
        fullDescription: 'Revolutionary feedback system using natural language processing to analyze student responses, identify patterns, predict satisfaction trends, generate automated action items, and provide personalized improvement recommendations. Includes anonymous feedback options, multi-language support, and integration with faculty development programs.',
        keywords: 'student feedback system, sentiment analysis for colleges, academic feedback ERP, NAAC compliance, faculty feedback, anonymous feedback, student satisfaction, teaching effectiveness',
        icon: '📝',
        features: ['Sentiment Analysis', 'Anonymous Submissions', 'Multi-language Support', 'Real-time Analytics', 'Automated Insights', 'Action Item Generation'],
        techStack: ['Natural Language Processing', 'Sentiment Analysis APIs', 'Machine Learning', 'Real-time Processing'],
        benefits: ['Real-time Insights', 'Anonymous Privacy', 'Actionable Recommendations', 'Continuous Improvement']
    },
    {
        id: 'faculty-profile',
        title: 'Dynamic Faculty Profile & Academic Repository',
        category: 'Productivity',
        description: 'Comprehensive faculty management system with digital portfolio creation, research publication tracking, certification management, and achievement showcasing. AI-powered profile optimization, automated CV generation, research collaboration matching, and exportable profiles for NAAC/NBA audits to enhance institutional credibility.',
        fullDescription: 'Complete faculty lifecycle management system featuring research impact tracking, collaboration network analysis, automated publication updates from academic databases, grant application assistance, professional development tracking, and integration with international academic networks for global visibility.',
        keywords: 'faculty profile management, academic repository, NAAC NBA compliance, faculty achievements ERP, research tracking, publication management, academic portfolio, faculty development',
        icon: '🧠',
        features: ['Digital Portfolio', 'Research Tracking', 'Publication Management', 'Collaboration Matching', 'Impact Analysis', 'Professional Development'],
        techStack: ['Academic APIs', 'Research Databases', 'CV Generation', 'Analytics Engine'],
        benefits: ['Professional Visibility', 'Research Impact Tracking', 'Automated Updates', 'Global Networking']
    },
    {
        id: 'fees-payment',
        title: 'Advanced Fees & Payment Management',
        category: 'Finance',
        description: 'Complete financial management solution with multi-payment gateway integration, installment tracking, automated reconciliation, and intelligent payment reminders. Features include scholarship management, financial aid tracking, fee structure customization, and comprehensive financial reporting for seamless operations in college ERP systems.',
        fullDescription: 'Enterprise-grade financial management system with advanced features like payment plan customization, automated late fee calculation, scholarship eligibility tracking, financial aid distribution, budget forecasting, expense management, and integration with accounting systems for complete financial transparency.',
        keywords: 'college fee management, payment gateway integration, fee tracking ERP, Razorpay integration, financial ERP, scholarship management, payment automation, financial reporting',
        icon: '💵',
        features: ['Multi-Gateway Integration', 'Automated Reconciliation', 'Scholarship Management', 'Payment Plans', 'Financial Reporting', 'Budget Forecasting'],
        techStack: ['Payment APIs', 'Accounting Integration', 'Financial Analytics', 'Automated Processing'],
        benefits: ['99.9% Payment Success', 'Automated Reconciliation', 'Reduced Administrative Work', 'Complete Financial Transparency']
    },
    {
        id: 'subject-timetable',
        title: 'AI-Powered Subject & Timetable Management',
        category: 'Productivity',
        description: 'Intelligent timetable generation with conflict resolution, resource optimization, and dynamic scheduling. AI algorithms automatically assign subjects, generate optimal department-wise timetables, detect and resolve clashes, enable real-time updates, and provide mobile-friendly timetable access with PDF export capabilities.',
        fullDescription: 'Revolutionary scheduling system using artificial intelligence to optimize resource utilization, minimize conflicts, balance faculty workloads, consider room capacities, integrate with event calendars, and provide what-if scenario planning for better academic planning and resource management.',
        keywords: 'timetable management, AI scheduling, subject assignment, college scheduling ERP, clash detection, timetable optimization, resource management, academic planning',
        icon: '📚',
        features: ['AI-Powered Scheduling', 'Conflict Resolution', 'Resource Optimization', 'Real-time Updates', 'Mobile Access', 'Scenario Planning'],
        techStack: ['Scheduling Algorithms', 'Optimization Engine', 'Conflict Detection', 'Mobile Responsive'],
        benefits: ['Optimal Resource Use', 'Zero Scheduling Conflicts', 'Real-time Adjustments', 'Mobile Accessibility']
    },
    {
        id: 'report-generation',
        title: 'Comprehensive Report Generation & Analytics',
        category: 'Analytics',
        description: 'Advanced reporting engine with customizable templates, real-time data visualization, and automated report distribution. Generate detailed formatted reports for attendance analytics, CO/PO mapping insights, assessment results, feedback analysis, and faculty performance metrics with export capabilities for NAAC/NBA audits.',
        fullDescription: 'Powerful business intelligence platform providing deep insights into institutional performance through advanced analytics, predictive modeling, custom dashboard creation, automated alert systems, benchmark comparisons, and integration with external data sources for comprehensive institutional analytics.',
        keywords: 'NAAC report generation, college ERP reports, academic report export, NBA compliance, report analytics, business intelligence, data visualization, institutional analytics',
        icon: '📄',
        features: ['Custom Templates', 'Real-time Visualization', 'Automated Distribution', 'Predictive Analytics', 'Dashboard Creation', 'Benchmark Comparisons'],
        techStack: ['Business Intelligence', 'Data Visualization', 'Report Engines', 'Analytics Platforms'],
        benefits: ['Instant Report Generation', 'Data-Driven Decisions', 'Compliance Ready', 'Visual Insights']
    },
    {
        id: 'mobile-app',
        title: 'Cross-Platform Mobile Application',
        category: 'Accessibility',
        description: 'Feature-rich mobile application built with React Native for seamless access to ERP functionalities. Students and faculty can view attendance records, access timetables, check exam schedules, receive push notifications, submit assignments, and communicate through integrated messaging system with offline synchronization capabilities.',
        fullDescription: 'Native mobile experience with advanced features including biometric authentication, offline data access, push notifications, file sharing, video conferencing integration, augmented reality campus maps, and AI-powered chatbot assistance for 24/7 support and enhanced user engagement.',
        keywords: 'college ERP mobile app, React Native education app, student mobile app, faculty mobile app, ERP notifications, offline access, mobile learning, campus app',
        icon: '🌐',
        features: ['Cross-Platform Support', 'Offline Synchronization', 'Push Notifications', 'Biometric Login', 'AR Campus Maps', 'AI Chatbot'],
        techStack: ['React Native', 'Offline Storage', 'Push Services', 'AR Framework'],
        benefits: ['24/7 Access', 'Offline Functionality', 'Native Performance', 'Enhanced Engagement']
    }
];

// Additional content sections
const testimonials = [
    {
        name: "Dr. Rajesh Kumar",
        position: "Principal, Tech Institute",
     
        content: "EduMatrix has revolutionized our academic management. The NAAC compliance features saved us months of preparation time."
    },
    {
        name: "Prof. Anita Sharma",
        position: "HOD Computer Science",
    
        content: "The OBE mapping module is incredibly intuitive. Our NBA accreditation process became seamless with EduMatrix."
    },
    {
        name: "Mr. Vikram Singh",
        position: "IT Administrator",
       
        content: "Implementation was smooth, and the technical support is outstanding. Best ERP solution for educational institutions."
    }
];

const stats = [
    { number: "500+", label: "Educational Institutions", icon: "🏫" },
    { number: "100K+", label: "Active Users", icon: "👥" },
    { number: "99.9%", label: "Uptime Guarantee", icon: "⚡" },
    { number: "24/7", label: "Technical Support", icon: "🛠️" }
];

const faqs = [
    {
        question: "How does EduMatrix ensure NAAC and NBA compliance?",
        answer: "EduMatrix is specifically designed with NAAC and NBA requirements in mind. Our OBE mapping module, comprehensive reporting system, and documentation features ensure complete compliance with accreditation standards. We provide automated report generation that meets all regulatory requirements."
    },
    {
        question: "Can EduMatrix integrate with existing college systems?",
        answer: "Yes, EduMatrix offers robust API integration capabilities and can seamlessly connect with your existing library management systems, accounting software, and other educational tools. Our technical team provides complete migration support."
    },
    {
        question: "What security measures does EduMatrix implement?",
        answer: "EduMatrix employs enterprise-grade security including end-to-end encryption, multi-factor authentication, role-based access control, regular security audits, and compliance with educational data protection regulations like FERPA."
    },
    {
        question: "How long does it take to implement EduMatrix?",
        answer: "Implementation typically takes 2-4 weeks depending on the size of your institution and customization requirements. We provide complete training, data migration, and ongoing support throughout the process."
    }
];

// SVG Icons Component
const SVGIcons = {
    Security: () => (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
    ),
    Analytics: () => (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
    ),
    Mobile: () => (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM8 4h4v10H8V4z" clipRule="evenodd" />
        </svg>
    ),
    Cloud: () => (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>
    )
};

const BlogPage = () => {
    const [activeModule, setActiveModule] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedModule, setSelectedModule] = useState(null);

    const router = useRouter();
    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Filter modules based on category and search
    const filteredModules = modules.filter(module => {
        const matchesCategory = selectedCategory === 'All' || module.category === selectedCategory;
        const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['All', ...new Set(modules.map(m => m.category))];

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5 },
        }),
        hover: { scale: 1.03, transition: { duration: 0.3 } },
    };

    const openModuleModal = (module) => {
        setSelectedModule(module);
        onOpen();
    };

    return (
        <>
            <Head>
                <title>EduMatrix Blog - Best College ERP System | NAAC NBA Compliance | Academic Management Software</title>
                <meta
                    name="description"
                    content="Discover EduMatrix, India's leading college ERP system with advanced features for NAAC NBA compliance, outcome-based education, attendance management, student feedback, and comprehensive academic administration. Built with modern MERN stack technology."
                />
                <meta
                    name="keywords"
                    content="college ERP system, EduMatrix ERP, best college management software, NAAC compliance software, NBA accreditation ERP, outcome-based education system, student information system, academic ERP, college administration software, education technology, campus management system, university ERP, student feedback system, attendance management, faculty management, fee management, timetable management, academic analytics, educational institution software, college automation, smart campus solution"
                />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:title" content="EduMatrix - Premier College ERP System for Academic Excellence" />
                <meta
                    property="og:description"
                    content="Transform your educational institution with EduMatrix, the most comprehensive college ERP system featuring NAAC/NBA compliance, smart attendance, OBE mapping, and advanced analytics."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://edumatrix.com/blog" />
                <meta property="og:image" content="https://edumatrix.com/og-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="EduMatrix - Leading College ERP System" />
                <meta name="twitter:description" content="Comprehensive ERP solution for educational institutions with NAAC/NBA compliance" />
                <link rel="canonical" href="https://edumatrix.com/blog" />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'SoftwareApplication',
                            name: 'EduMatrix College ERP System',
                            description: 'Comprehensive college ERP system for academic management, NAAC/NBA compliance, and institutional excellence',
                            url: 'https://edumatrix.com',
                            applicationCategory: 'EducationalApplication',
                            operatingSystem: 'Web, iOS, Android',
                            offers: {
                                '@type': 'Offer',
                                priceCurrency: 'INR',
                                availability: 'https://schema.org/InStock'
                            },
                            aggregateRating: {
                                '@type': 'AggregateRating',
                                ratingValue: '4.9',
                                ratingCount: '250'
                            }
                        }),
                    }}
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800">
                {/* Enhanced Hero Section */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative py-24 text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden"
                >
                    {/* Animated Background */}
                    <div
                        className="absolute inset-0 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.2%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] bg-repeat"
                        style={{
                            animation: 'pulseBackground 4s ease-in-out infinite',
                        }}
                    />

                    <div className="relative z-10 max-w-6xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="mb-6"
                        >
                            <Badge content="New Features" color="warning" className="mb-4">
                                <Chip className="bg-white/20 text-white border-white/30">Latest Updates</Chip>
                            </Badge>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
                        >
                            EduMatrix College ERP
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed"
                        >
                            India's Most Advanced College ERP System for NAAC/NBA Compliance, Academic Excellence, and Institutional Growth. Transform your educational institution with cutting-edge technology and comprehensive management solutions.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Button
                                as={Link}
                                href="#modules"
                                size="lg"
                                className="bg-white text-blue-600 font-semibold hover:bg-blue-50 px-8 py-3"
                                startContent={<SVGIcons.Analytics />}
                            >
                                Explore ERP Modules
                            </Button>
                            <Button
                                as={Link}
                                href="/demo"
                                size="lg"
                                variant="bordered"
                                className="border-white text-white hover:bg-white/10 px-8 py-3"
                                startContent={<SVGIcons.Mobile />}
                            >
                                Request Demo
                            </Button>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Stats Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="text-center"
                                >
                                    <div className="text-4xl mb-2">{stat.icon}</div>
                                    <div className="text-3xl font-bold text-blue-600 mb-1">{stat.number}</div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Search and Filter Section */}
                <section className="py-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <Input
                                placeholder="Search ERP modules..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-md"
                                startContent={<span>🔍</span>}
                            />
                            <Tabs
                                selectedKey={selectedCategory}
                                onSelectionChange={setSelectedCategory}
                                variant="underlined"
                                classNames={{
                                    tabList: "gap-6",
                                    cursor: "bg-blue-600",
                                    tab: "max-w-fit px-4 h-12",
                                }}
                            >
                                {categories.map((category) => (
                                    <Tab key={category} title={category} />
                                ))}
                            </Tabs>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div id="modules" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-12">
                    {/* Enhanced Sidebar */}
                    <aside className="lg:w-1/4 sticky top-20 self-start">
                        <Card className="p-6 shadow-xl bg-gradient-to-br from-white to-blue-50 border border-blue-100">
                            <CardHeader className="pb-4">
                                <h3 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                                    <SVGIcons.Analytics />
                                    ERP Module Navigator
                                </h3>
                            </CardHeader>
                            <CardBody>
                                <Divider className="my-4" />
                                <ul className="space-y-3">
                                    {modules.map((module) => (
                                        <motion.li
                                            key={module.id}
                                            whileHover={{ x: 5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Link
                                                href={`#${module.id}`}
                                                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${activeModule === module.id
                                                    ? 'bg-blue-100 text-blue-800 font-semibold border-l-4 border-blue-600'
                                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                                    }`}
                                                onClick={() => setActiveModule(module.id)}
                                            >
                                                <span className="text-xl">{module.icon}</span>
                                                <span className="text-sm">{module.title}</span>
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>

                                <Divider className="my-6" />

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800">Quick Actions</h4>
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                        startContent={<SVGIcons.Cloud />}
                                    >
                                        Schedule Demo
                                    </Button>
                                    <Button
                                        variant="bordered"
                                        className="w-full border-blue-600 text-blue-600"
                                        startContent={<SVGIcons.Mobile />}
                                    >
                                        Download Brochure
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </aside>

                    {/* Enhanced Modules Grid */}
                    <section className="lg:w-3/4">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Comprehensive ERP Modules for Educational Excellence
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Discover our complete suite of ERP modules designed specifically for Indian educational institutions. Each module is crafted to ensure NAAC/NBA compliance while enhancing operational efficiency and academic outcomes.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredModules.map((module, index) => (
                                <motion.div
                                    key={module.id}
                                    custom={index}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    className="group"
                                >
                                    <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-blue-200 bg-gradient-to-br from-white to-gray-50">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                                    <span className="text-3xl">{module.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                                        {module.title}
                                                    </h3>
                                                    <div className="flex gap-2 mb-3">
                                                        <Chip
                                                            color="primary"
                                                            variant="flat"
                                                            size="sm"
                                                            className="bg-blue-100 text-blue-800"
                                                        >
                                                            {module.category}
                                                        </Chip>
                                                        <Chip
                                                            color="success"
                                                            variant="flat"
                                                            size="sm"
                                                            className="bg-green-100 text-green-800"
                                                        >
                                                            NAAC Ready
                                                        </Chip>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardBody className="pt-0">
                                            <p className="text-gray-600 mb-4 leading-relaxed">
                                                {module.description}
                                            </p>

                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                        <span>⭐</span> Key Features
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {module.features.slice(0, 3).map((feature, idx) => (
                                                            <Chip
                                                                key={idx}
                                                                size="sm"
                                                                variant="flat"
                                                                className="bg-gray-100 text-gray-700 text-xs"
                                                            >
                                                                {feature}
                                                            </Chip>
                                                        ))}
                                                        {module.features.length > 3 && (
                                                            <Chip
                                                                size="sm"
                                                                variant="flat"
                                                                className="bg-blue-50 text-blue-600 text-xs"
                                                            >
                                                                +{module.features.length - 3} more
                                                            </Chip>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                        <span>🚀</span> Benefits
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {module.benefits.map((benefit, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                {benefit}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <Divider className="my-4" />

                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => openModuleModal(module)}
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                                                    size="sm"
                                                >
                                                    Learn More
                                                </Button>
                                                <Tooltip content="Request Demo">
                                                    <Button
                                                        isIconOnly
                                                        variant="bordered"
                                                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                                        size="sm"
                                                    >
                                                        🎯
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Technology Stack Section */}
                <section className="py-16 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">Built with Modern Technology Stack</h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                EduMatrix leverages cutting-edge technologies to deliver unparalleled performance, security, and scalability for educational institutions of all sizes.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
                            {[
                                { name: "Next.js", icon: "⚛️", description: "React Framework" },
                                { name: "Node.js", icon: "🟢", description: "Backend Runtime" },
                                { name: "PostgreSQL", icon: "🐘", description: "Database" },
                                { name: "AWS", icon: "☁️", description: "Cloud Platform" },
                                { name: "React Native", icon: "📱", description: "Mobile Apps" },
                                { name: "TypeScript", icon: "🔷", description: "Type Safety" }
                            ].map((tech, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="text-center group cursor-pointer"
                                >
                                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                        {tech.icon}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">{tech.name}</h3>
                                    <p className="text-gray-400 text-sm">{tech.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
                            <p className="text-xl text-gray-600">
                                Trusted by leading educational institutions across India
                            </p>
                        </div>

                        <Card className="max-w-4xl mx-auto shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                            <CardBody className="p-8">
                                <motion.div
                                    key={currentTestimonial}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center"
                                >
                                    <div className="text-6xl text-blue-600 mb-4">"</div>
                                    <p className="text-xl text-gray-700 mb-6 leading-relaxed italic">
                                        {testimonials[currentTestimonial].content}
                                    </p>
                                    <div className="flex items-center justify-center gap-4">
                                        
                                        <div>
                                            <h4 className="font-bold text-gray-900">
                                                {testimonials[currentTestimonial].name}
                                            </h4>
                                            <p className="text-blue-600">
                                                {testimonials[currentTestimonial].position}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="flex justify-center gap-2 mt-6">
                                    {testimonials.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentTestimonial(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                            <p className="text-xl text-gray-600">
                                Get answers to common questions about EduMatrix ERP system
                            </p>
                        </div>

                        <Accordion variant="splitted" className="gap-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    aria-label={faq.question}
                                    title={faq.question}
                                    className="bg-white shadow-md border border-gray-200 rounded-xl"
                                    classNames={{
                                        title: "font-semibold text-gray-900",
                                        content: "text-gray-600 leading-relaxed"
                                    }}
                                >
                                    {faq.answer}
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                {/* CTA Section */}
                <section id="demo" className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready to Transform Your Institution?
                            </h2>
                            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                                Join 500+ educational institutions that have revolutionized their academic management with EduMatrix. Experience the power of modern ERP technology designed specifically for Indian colleges and universities.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button
                                    size="lg"
                                    // onPress={route.replace("/demo")}
                                    className="bg-white text-blue-600 font-semibold hover:bg-gray-100 px-8 py-4 text-lg"
                                    startContent={<span className="text-xl">🚀</span>}
                                >
                                    Schedule Free Demo
                                </Button>
                                <Button
                                    size="lg"
                                    variant="bordered"
                                    className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
                                    startContent={<span className="text-xl">📞</span>}
                                >
                                    Call: +91-8788761515
                                </Button>
                            </div>

                            <div className="mt-8 flex justify-center items-center gap-8 text-sm opacity-90">
                                <div className="flex items-center gap-2">
                                    <span>✅</span> Free 30-day trial
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>✅</span> Complete data migration
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>✅</span> 24/7 support included
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Enhanced Footer */}
                <Footer />

                {/* Module Detail Modal */}
                <Modal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    size="5xl"
                    scrollBehavior="inside"
                    classNames={{
                        base: "bg-white",
                        header: "border-b border-gray-200",
                        body: "py-6",
                        footer: "border-t border-gray-200"
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    {selectedModule && (
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl">{selectedModule.icon}</span>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">{selectedModule.title}</h2>
                                                <Chip color="primary" variant="flat" className="mt-2">
                                                    {selectedModule.category}
                                                </Chip>
                                            </div>
                                        </div>
                                    )}
                                </ModalHeader>
                                <ModalBody>
                                    {selectedModule && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Overview</h3>
                                                <p className="text-gray-600 leading-relaxed">{selectedModule.fullDescription}</p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Key Features</h3>
                                                    <ul className="space-y-2">
                                                        {selectedModule.features.map((feature, index) => (
                                                            <li key={index} className="flex items-center gap-3">
                                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                <span className="text-gray-700">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Technology Stack</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedModule.techStack.map((tech, index) => (
                                                            <Chip key={index} variant="flat" className="bg-gray-100 text-gray-700">
                                                                {tech}
                                                            </Chip>
                                                        ))}
                                                    </div>

                                                    <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900">Benefits</h3>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {selectedModule.benefits.map((benefit, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <span className="text-green-600">✅</span>
                                                                <span className="text-gray-700 text-sm">{benefit}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                    <Button variant="light" onPress={onClose}>
                                        Close
                                    </Button>
                                    <Button className="bg-blue-600 text-white" onPress={onClose}>
                                        Request Demo for This Module
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </>
    );
};

export default BlogPage;